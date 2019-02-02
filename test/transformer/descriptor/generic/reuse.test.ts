import { createMock } from "ts-auto-mock";
import { stringify } from "querystring";

describe('reuse ', () => {
    interface Interface<T> {
        value: T;
    }

    interface InterfaceWithMultipleGenerics<T, P> {
        valueT: T;
        valueP: P;
    }

    it('should work for a single generic', () => {
        const properties: Interface<string> = createMock<Interface<string>>();
        expect(properties.value).toBe("");

        const propertiesNumber: Interface<number> = createMock<Interface<number>>();
        expect(propertiesNumber.value).toBe(0);

        const propertiesBoolean: Interface<boolean> = createMock<Interface<boolean>>();
        expect(propertiesBoolean.value).toBe(false);
    });

    // it("should work for multiple generics", () => {
    //     const propertiesA: InterfaceWithMultipleGenerics<string, number> = createMock<InterfaceWithMultipleGenerics<string, number>>();
    //     expect(propertiesA.valueT).toBe("");
    //     expect(propertiesA.valueP).toBe(0);
    // });
});

/// createMock<Interface>();

// repository.getFactory("")(generics)();