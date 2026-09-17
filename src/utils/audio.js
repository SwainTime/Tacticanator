export function playMoveSound() {
  try {
    const moveSound = new Audio('/sounds/move.mp3');
    moveSound.play().catch(() => {

    });
  } catch (error) {
  
  }
}