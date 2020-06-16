
export const jbIsPlayer = (seat: number) => {
  switch (seat) {
    case 1:
    case 2:
    case 3:
    case 4:
      return true;
    default:
      return false;
  }
}
