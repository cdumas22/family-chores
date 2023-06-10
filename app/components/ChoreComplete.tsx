import { useState } from "react";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";
import { useChoreContext } from "~/root";

export default function () {
  const { width, height } = useWindowSize();
  const choreContext = useChoreContext();

  function hide() {
    choreContext.choreComplete = false;
  }
  return (
    <Confetti
      width={width}
      height={height}
      numberOfPieces={5000}
      recycle={false}
      onConfettiComplete={hide}
      colors={choreContext.choreColor ? [choreContext.choreColor] : undefined}
    />
  );
}
