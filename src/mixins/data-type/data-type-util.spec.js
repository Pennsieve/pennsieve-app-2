import { getFormatter } from "./utils";

describe('model property formatter', () => {
  describe('Number', () => {
    describe('Long', () => {
      it('single long', () => {
        const property = {
          "conceptTitle": false,
          "dataType": "Long",
          "default": false,
          "displayName": "number boi",
          "locked": false,
          "name": "number_boi",
          "required": false,
          "value": 123
        };

        expect(getFormatter(property.dataType)(property.value)).toEqual("123")

      })

      it('multi long', () => {
        const property = {
          "conceptTitle": false,
          "dataType": {
            "items": {
              "type": "Long"
            },
            "type": "array"
          },
          "default": false,
          "displayName": "multi numberey boi",
          "locked": false,
          "name": "multi_numberey_boi",
          "required": false,
          "value": [
            3,
            4
          ]
        };

        const formatter = getFormatter(property.dataType)
        expect(property.value.map(v => formatter(v)).join(", ")).toEqual("3, 4")

      })

      it('single long with sci unit', () => {
        const property = {
          "conceptTitle": false,
          "dataType": {
            type: "Long",
            unit: "s",
          },
          "default": false,
          "displayName": "number boi",
          "locked": false,
          "name": "number_boi",
          "required": false,
          "value": 123
        };

        expect(getFormatter(property.dataType)(property.value)).toEqual("123 s")

      })

      it('multi long with sci unit', () => {
        const property = {
          "conceptTitle": false,
          "dataType": {
            "items": {
              "type": "Long",
              "unit": "s"
            },
            "type": "array"
          },
          "default": false,
          "displayName": "multi numberey boi",
          "locked": false,
          "name": "multi_numberey_boi",
          "required": false,
          "value": [
            3,
            4
          ]
        };

        const formatter = getFormatter(property.dataType)
        expect(property.value.map(v => formatter(v)).join(", ")).toEqual("3 s, 4 s")

      })
    })

    describe('Double', () => {
      it('single double', () => {
        const property = {
          "conceptTitle": false,
          "dataType": "Double",
          "default": false,
          "displayName": "number boi",
          "locked": false,
          "name": "number_boi",
          "required": false,
          "value": 123
        };

        expect(getFormatter(property.dataType)(property.value)).toEqual("123.0")
      })

      it('multi double', () => {
        const property = {
          "conceptTitle": false,
          "dataType": {
            "items": {
              "type": "Double"
            },
            "type": "array"
          },
          "default": false,
          "displayName": "multi numberey boi",
          "locked": false,
          "name": "multi_numberey_boi",
          "required": false,
          "value": [
            3,
            4
          ]
        };

        const formatter = getFormatter(property.dataType)
        expect(property.value.map(v => formatter(v)).join(", ")).toEqual("3.0, 4.0")

      })

      it('single double with sci unit', () => {
        const property = {
          "conceptTitle": false,
          "dataType": {
            type: "Double",
            unit: "s",
          },
          "default": false,
          "displayName": "number boi",
          "locked": false,
          "name": "number_boi",
          "required": false,
          "value": 123
        };

        expect(getFormatter(property.dataType)(property.value)).toEqual("123.0 s")

      })

      it('multi double with sci unit and capital A Array type', () => {
        const property = {
          "conceptTitle": false,
          "dataType": {
            "items": {
              "type": "Double",
              "unit": "s"
            },
            "type": "Array"
          },
          "default": false,
          "displayName": "multi numberey boi",
          "locked": false,
          "name": "multi_numberey_boi",
          "required": false,
          "value": [
            3,
            4
          ]
        };

        const formatter = getFormatter(property.dataType)
        expect(property.value.map(v => formatter(v)).join(", ")).toEqual("3.0 s, 4.0 s")

      })

      it('double with multiple digits of precision', () => {
        const property = {
          "conceptTitle": false,
          "dataType": "Double",
          "default": false,
          "displayName": "number boi",
          "locked": false,
          "name": "number_boi",
          "required": false,
          "value": 123.0321
        };

        expect(getFormatter(property.dataType)(property.value)).toEqual("123.03")

      })
    })
  })

  describe('String', () => {
    it('single string', () => {
      const property = {
        "conceptTitle": true,
        "dataType": "String",
        "default": true,
        "displayName": "name",
        "locked": false,
        "name": "name",
        "required": false,
        "value": "foo bar"
      }

      expect(getFormatter(property.dataType)(property.value)).toEqual("foo bar")

    })

    it('multi string', () => {
      const property = {
        "conceptTitle": false,
        "dataType": {
          "items": {
            "enum": [
              "bar",
              "foo"
            ],
              "format": null,
              "type": "String"
          },
          "type": "array"
        },
        "default": false,
        "displayName": "string enum",
        "locked": false,
        "name": "string_enum",
        "required": false,
        "value": [
          "bar",
          "foo"
        ]
      }

      const formatter = getFormatter(property.dataType)
      expect(property.value.map(v => formatter(v)).join(", ")).toEqual("bar, foo")

    })

    it('string with Email subtype', () => {
      const property = {
        "conceptTitle": false,
        "dataType": {
          "format": "Email",
          "type": "String"
        },
        "default": false,
        "displayName": "string enum",
        "locked": false,
        "name": "string_enum",
        "required": false,
        "value": "abc@def.com",
      }

      const formatter = getFormatter(property.dataType)
      expect(formatter(property.value).startsWith(`<a href="mailto:abc@def.com"`)).toBe(true)

    })

    it('string with URL subtype', () => {
      const property = {
        "conceptTitle": false,
        "dataType": {
          "format": "URL",
          "type": "String"
        },
        "default": false,
        "displayName": "string enum",
        "locked": false,
        "name": "string_enum",
        "required": false,
        "value": "http://www.abc.com",
      }

      const formatter = getFormatter(property.dataType)
      expect(formatter(property.value).startsWith(`<a href="http://www.abc.com"`)).toBe(true)

    })

    it('multi string with subtype', () => {
      const property = {
        "conceptTitle": false,
        "dataType": {
          "items": {
            "format": "Email",
            "type": "String"
          },
          "type": "array"
        },
        "default": false,
        "displayName": "string enum",
        "locked": false,
        "name": "string_enum",
        "required": false,
        "value": [
          "abc@def.com",
          "abc@def.com"
        ]
      }

      const formatter = getFormatter(property.dataType)
      expect(formatter(property.value[0]).startsWith(`<a href="mailto:abc@def.com"`)).toBe(true)

    })
  })

  describe('Date', () => {
    it('single date', () => {
      const property = {
        "conceptTitle": false,
        "dataType": "Date",
        "default": false,
        "displayName": "date",
        "locked": false,
        "name": "date",
        "required": false,
        "value": "2020-03-11T00:00:00"
      }

      expect(getFormatter(property.dataType)(property.value)).toEqual("March 11, 2020 00:00:00")

    })

    it('multi date', () => {
      const property = {
        "conceptTitle": false,
        "dataType": {
          "items": {
            "type": "Date"
          },
          "type": "array"
        },
        "default": false,
        "displayName": "date multi",
        "locked": false,
        "name": "date_multi",
        "required": false,
        "value": [
          "2020-03-25T00:00:00",
          "2020-03-12T00:00:00"
        ]
      }

      const formatter = getFormatter(property.dataType)
      expect(property.value.map(v => formatter(v)).join(", ")).toEqual("March 25, 2020 00:00:00, March 12, 2020 00:00:00")

    })

    it('single date as string subtype', () => {
      const property = {
        "conceptTitle": false,
        "dataType": {
          type: "String",
          format: "Date"
        },
        "default": false,
        "displayName": "date",
        "locked": false,
        "name": "date",
        "required": false,
        "value": "2020-03-11T00:00:00"
      }

      expect(getFormatter(property.dataType)(property.value)).toEqual("March 11, 2020 00:00:00")

    })

    it('multi date as string subtype', () => {
      const property = {
        "conceptTitle": false,
        "dataType": {
          "items": {
            "type": "String",
            format: "Date"
          },
          "type": "array"
        },
        "default": false,
        "displayName": "date multi",
        "locked": false,
        "name": "date_multi",
        "required": false,
        "value": [
          "2020-03-25T00:00:00",
          "2020-03-12T00:00:00"
        ]
      }

      const formatter = getFormatter(property.dataType)
      expect(property.value.map(v => formatter(v)).join(", ")).toEqual("March 25, 2020 00:00:00, March 12, 2020 00:00:00")

    })
  })

  describe('Boolean', () => {
    it('true simple', () => {
      const property = {
        "conceptTitle": false,
        "dataType": "Boolean",
        "default": false,
        "displayName": "number boi",
        "locked": false,
        "name": "number_boi",
        "required": false,
        "value": "true"
      };

      expect(getFormatter(property.dataType)(property.value)).toEqual("True")

    })

    it('false complex', () => {
      const property = {
        "conceptTitle": false,
        "dataType": {
          "type": "Boolean"
        },
        "default": false,
        "displayName": "number boi",
        "locked": false,
        "name": "number_boi",
        "required": false,
        "value": "false"
      };

      expect(getFormatter(property.dataType)(property.value)).toEqual("False")

    })


  })
})
