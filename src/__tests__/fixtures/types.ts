
export interface ITest {
  /**
   * a
   *
   * @minimum 1
   */
  a: number;
}

export interface ITest2 {
  c: 1 | 2 | 3;
  reffed: IRefMe[];
}

export interface IRefMe {
  a: { c: 1 };
}

export interface IRefTest extends IRefMe {
  /**
   * @$ref test-ref#
   */
  a: any;
}
