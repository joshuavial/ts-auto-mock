import * as ts from 'typescript';
import { ArrayFromLength } from '../array/array';
import { GetDescriptor } from '../descriptor/descriptor';
import { getMockMergeExpression, getMockMergeIteratorExpression } from '../mergeExpression/mergeExpression';
import { GetMockFactoryCall } from '../mockFactoryCall/mockFactoryCall';
import { isTypeReusable } from '../typeValidator/typeValidator';

function getMockExpression(nodeToMock: ts.TypeNode): ts.Expression {
    if (isTypeReusable(nodeToMock)) {
        return GetMockFactoryCall(nodeToMock);
    }

    return GetDescriptor(nodeToMock);
}

function hasDefaultValues(node: ts.CallExpression): boolean {
    return node.arguments.length && !!node.arguments[0];
}

function hasDefaultListValues(node: ts.CallExpression): boolean {
    return !!node.arguments[1];
}

function getNumberFromNumericLiteral(numericLiteral: ts.NumericLiteral): number {
    const numericLiteralNumber: number = parseInt(numericLiteral.text, 10);
    return numericLiteralNumber > 0 ? numericLiteralNumber : 0;
}

function getMockMergeListExpression(mock: ts.Expression, length: number, defaultValues: ts.Expression): ts.Expression[] {
    return ArrayFromLength(length).map((index: number) => {
        return getMockMergeIteratorExpression(mock, defaultValues, ts.createNumericLiteral('' + index));
    });
}

function getMockListExpression(mock: ts.Expression, length: number): ts.Expression[] {
    return ArrayFromLength(length).map(() => {
        return mock;
    });
}

export function getMock(nodeToMock: ts.TypeNode, node: ts.CallExpression): ts.Expression {
    const mockExpression: ts.Expression = getMockExpression(nodeToMock);

    if (hasDefaultValues(node)) {
        return getMockMergeExpression(mockExpression, node.arguments[0]);
    }

    return mockExpression;
}

export function getMockForList(nodeToMock: ts.TypeNode, node: ts.CallExpression): ts.ArrayLiteralExpression {
    const mock: ts.Expression = getMockExpression(nodeToMock);
    const lengthLiteral: ts.NumericLiteral = node.arguments[0] as ts.NumericLiteral;

    if (!lengthLiteral) {
       return ts.createArrayLiteral([]);
    }

    const length: number = getNumberFromNumericLiteral(lengthLiteral);

    if (hasDefaultListValues(node)) {
        const mockMergeList: ts.Expression[] = getMockMergeListExpression(mock, length, node.arguments[1]);

        return ts.createArrayLiteral(mockMergeList);
    }

    const mockList: ts.Expression[] = getMockListExpression(mock, length);

    return ts.createArrayLiteral(mockList);
}
