/* eslint-disable unused-imports/no-unused-vars */

function function_declaration() {}
function outer_function() {
  function inner_function_1() {}
  function inner_function_2() {}
  function inner_function_3() {}
}

const assigned_function = function () {};
const assigned_function_with_params = function (params: any) {};
const assigned_function_named = function named_fn() {};
const arrow_function = () => {};
const arrow_function_with_params = (a: number, b: string) => {};
const arrow_function_with_return = (a: number): number => a;
const arrow_function_with_body = (a: number): number => {
  return a * 2;
};
export function exported_function() {}

function function_with_object_pattern({
  a,
  b,
  c = 3,
  d = 1,
  ...e
}: {
  a: number;
  b: number;
  c: number;
  d?: number;
  [k: string]: any;
}) {}

function function_with_array_pattern([a, b, c, d, ...e]: number[]) {}
