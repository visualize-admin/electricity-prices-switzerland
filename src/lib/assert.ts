function assert(predicate: boolean, message: string): asserts predicate {
  if (!predicate) {
    throw new Error(message);
  }
}

export default assert;
