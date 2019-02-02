import * as ts from 'typescript';
const urlSlug = require("url-slug");
import { TypeChecker } from '../typeChecker/typeChecker';
import { GetDescriptor } from '../descriptor/descriptor';
import { createImportOnIdentifier } from '../helper/import';
import { FactoryDefinitionCache } from './factoryDefinitionCache';
import { GetTypeReferenceDescriptor } from "../descriptor/typeReference/typeReference";
import { TypescriptHelper } from '../descriptor/helper/helper';
type PossibleTypeNode = ts.TypeReferenceNode | ts.FunctionTypeNode | ts.TypeLiteralNode;

function GetPossibleDescriptor(node: ts.Node): ts.Expression {
    if (node.kind === ts.SyntaxKind.TypeReference) {
        return GetTypeReferenceDescriptor((node as ts.TypeReferenceNode))
    }

    return GetDescriptor(node);
}

export class MockDefiner {
	private _typeChecker: ts.TypeChecker;
	private _neededImportIdentifierPerFile: { [key: string]: ts.Identifier } = {};
	private _factoryRegistrationsPerFile: { [key: string]: Array<{ key: ts.Declaration; factory: ts.Expression }> } = {};
	private _factoryCache: FactoryDefinitionCache;

	private static _instance: MockDefiner;
    public currentTsAutoMockImportName: ts.Identifier;
    private _fileName: string;

    public static get instance(): MockDefiner {
		this._instance = this._instance || new MockDefiner();
		return this._instance;
	}

	private constructor() {
		this._factoryCache = new FactoryDefinitionCache();
		this._typeChecker = TypeChecker();
	}

    public setFileNameFromNode(node: ts.TypeNode): void {
        const thisFile = node.getSourceFile();
        this._fileName = thisFile.fileName;
    }

	public getTopStatementsForFile(sourceFile: ts.SourceFile): Array<ts.Statement> {
		return [...this._getImportsToAddInFile(sourceFile), ...this._getExportsToAddInFile(sourceFile)];
	}

	public initFile(sourceFile: ts.SourceFile): void {
		this._factoryRegistrationsPerFile[sourceFile.fileName] = [];
	}

	public getMockFactory(node: PossibleTypeNode): ts.Expression {
		this._typeChecker = TypeChecker();
		const definedType: ts.Type = this._typeChecker.getTypeAtLocation(node);
		let declaration = TypescriptHelper.GetDeclarationFromType(definedType);

		const thisFileName: string = this._fileName;

		if (!this._neededImportIdentifierPerFile[thisFileName]) {
			this._neededImportIdentifierPerFile[thisFileName] = ts.createFileLevelUniqueName(`${urlSlug(thisFileName, '_')}_repository`);
		}
		this.currentTsAutoMockImportName = this._neededImportIdentifierPerFile[thisFileName];

		const key: string = this._getMockFactoryId(thisFileName, node, declaration as ts.Declaration);

		const callFactory = ts.createCall(
			ts.createPropertyAccess(
				this._mockRepositoryAccess(thisFileName),
				ts.createIdentifier('getFactory')
			),
			[],
			[ts.createStringLiteral(key)]
		);

		const nnode = (node as ts.TypeReferenceNode);

		const arg = nnode.typeArguments[0];

		const des = GetDescriptor(arg);


		return ts.createCall(callFactory, [], [des]);
	}

	private _mockRepositoryAccess(filename: string): ts.Expression {
		return ts.createPropertyAccess(
			ts.createPropertyAccess(
				this._neededImportIdentifierPerFile[filename],
				ts.createIdentifier('MockRepository')
			),
			ts.createIdentifier('instance')
		);
	}

	private _getMockFactoryId(thisFileName: string, type: PossibleTypeNode, declaration: ts.Declaration): string {
		if (this._factoryCache.hasFactoryForTypeMock(declaration)) {
			return this._factoryCache.getFactoryKeyForTypeMock(declaration);
		}

		this._factoryCache.setFactoryKeyForTypeMock(
			declaration,
			this._factoryCache.createUniqueKeyForFactory(declaration)
		);

		this._factoryRegistrationsPerFile[thisFileName] = this._factoryRegistrationsPerFile[thisFileName] || [];

		const descriptor = GetPossibleDescriptor(type);

		const fn = ts.createFunctionExpression(undefined, undefined, undefined, undefined, [], undefined,
			ts.createBlock(
				[ts.createReturn(descriptor)]
			)
		);

		const test = ts.createParameter([], [], undefined, "sss");
		
		this._factoryRegistrationsPerFile[thisFileName].push({
			key: declaration,
			factory: ts.createFunctionExpression(undefined, undefined, undefined, undefined, [test], undefined,
				ts.createBlock(
					[ts.createReturn(fn)]
				)
			)
		});

		return this._factoryCache.getFactoryKeyForTypeMock(declaration);
	}

	private _getImportsToAddInFile(sourceFile: ts.SourceFile): Array<ts.Statement> {
		if (this._neededImportIdentifierPerFile[sourceFile.fileName]) {
			return [createImportOnIdentifier('ts-auto-mock', this._neededImportIdentifierPerFile[sourceFile.fileName])];
		}

		return [];
	}

	private _getExportsToAddInFile(sourceFile: ts.SourceFile): Array<ts.Statement> {
		if (this._factoryRegistrationsPerFile[sourceFile.fileName]) {
			return this._factoryRegistrationsPerFile[sourceFile.fileName]
				.map(reg => this._createRegistration(sourceFile.fileName, reg.key, reg.factory));
		}

		return [];
	}

	private _createRegistration(filename: string, key: ts.Declaration, factory: ts.Expression): ts.Statement {
		return ts.createExpressionStatement(
			ts.createCall(
				ts.createPropertyAccess(
					this._mockRepositoryAccess(filename),
					ts.createIdentifier('registerFactory')
				),
				[],
				[ts.createStringLiteral(this._factoryCache.getFactoryKeyForTypeMock(key)), factory]
			)
		);
	}
}
