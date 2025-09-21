export function cn() {
  const classes = Array.prototype.slice.call(arguments).filter(Boolean)
  return classes.join(" ")
}