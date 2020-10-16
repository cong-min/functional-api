const main = () => 'main function';
const test = {
  func: () => 'test.func function',
  test: {
    func: () => 'test.test.func function',
  },
};
const str = '';

export default () => 'default function';
export {
  main,
  test,
  str,
};
