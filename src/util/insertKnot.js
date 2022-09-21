/**
 * Knot insertion is known as "Boehm's algorithm"
 *
 * https://math.stackexchange.com/questions/417859/convert-a-b-spline-into-bezier-curves
 * code adapted from http://preserve.mactech.com/articles/develop/issue_25/schneider.html
 */
export default (k, controlPoints, knots, newKnot) => {
  const x = knots
  const b = controlPoints
  const n = controlPoints.length
  let i = 0
  let foundIndex = false
  for (let j = 0; j < n + k; j++) {
    if (newKnot > x[j] && newKnot <= x[j + 1]) {
      i = j
      foundIndex = true
      break
    }
  }
  if (!foundIndex) {
    throw new Error('invalid new knot')
  }

  const xHat = []
  for (let j = 0; j < n + k + 1; j++) {
    if (j <= i) {
      xHat[j] = x[j]
    } else if (j === i + 1) {
      xHat[j] = newKnot
    } else {
      xHat[j] = x[j - 1]
    }
  }

  let alpha
  const bHat = []
  for (let j = 0; j < n + 1; j++) {
    if (j <= i - k + 1) {
      alpha = 1
    } else if (i - k + 2 <= j && j <= i) {
      if (x[j + k - 1] - x[j] === 0) {
        alpha = 0
      } else {
        alpha = (newKnot - x[j]) / (x[j + k - 1] - x[j])
      }
    } else {
      alpha = 0
    }

    if (alpha === 0) {
      bHat[j] = b[j - 1]
    } else if (alpha === 1) {
      bHat[j] = b[j]
    } else {
      bHat[j] = {
        x: (1 - alpha) * b[j - 1].x + alpha * b[j].x,
        y: (1 - alpha) * b[j - 1].y + alpha * b[j].y,
      }
    }
  }
  return { controlPoints: bHat, knots: xHat }
}
