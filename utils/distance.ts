export function checkDistance(
  userPosition: { x: number; y: number },
  answerPosition: { x: number; y: number }
) {
  let earthRadius = 6371; // Radius of the earth in km
  let latDistance = degreesToRadians(answerPosition.x - userPosition.x); // deg2rad below
  let lngDistance = degreesToRadians(answerPosition.y - userPosition.y);
  let a =
    Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
    Math.cos(degreesToRadians(userPosition.x)) *
      Math.cos(degreesToRadians(answerPosition.x)) *
      Math.sin(lngDistance / 2) *
      Math.sin(lngDistance / 2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let distance = earthRadius * c; // Distance in km
  return Math.floor(distance * 1000); //distance in m
}
export function degreesToRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}
