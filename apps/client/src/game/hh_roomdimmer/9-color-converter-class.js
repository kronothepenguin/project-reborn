export function RGBtoHSL(tRGB) {
  if (tRGB.ilk == Symbol.for("color")) {
    tRGB = list(tRGB.red, tRGB.green, tRGB.blue);
  }
  tRGB = tRGB / 255.0;
  const tDiff = float(tRGB.max() - tRGB.min());
  let tH = 0;
  if (tDiff != 0) {
    if ((tRGB.max() == tRGB[1]) && (tRGB[2] >= tRGB[3])) {
      tH = 60 * (tRGB[2] - tRGB[3]) / tDiff;
    } else {
      if ((tRGB.max() == tRGB[1]) && (tRGB[2] < tRGB[3])) {
        tH = (60 * (tRGB[2] - tRGB[3]) / tDiff) + 360;
      } else {
        if (tRGB.max() == tRGB[2]) {
          tH = (60 * (tRGB[3] - tRGB[1]) / tDiff) + 120;
        } else {
          if (tRGB.max() == tRGB[3]) {
            tH = (60 * (tRGB[1] - tRGB[2]) / tDiff) + 240;
          }
        }
      }
    }
  }
  let tL = 0.5 * (tRGB.max() + tRGB.min());
  let tS = 0;
  if (tDiff != 0) {
    if (tL <= 0.5) {
      tS = tDiff / tL * 0.5;
    } else {
      if (tL > 0.5) {
        tS = tDiff / (1 - tL) * 0.5;
      }
    }
  }
  tH = integer(tH / 360 * 255);
  tS = integer(tS * 255);
  tL = integer(tL * 255);
  return list(tH, tS, tL);
}

export function HSLtoRGB(tHSL) {
  tHSL = tHSL / 255.0;
  let tQ;
  if (tHSL[3] < 0.5) {
    tQ = tHSL[3] * (1 + tHSL[2]);
  } else {
    tQ = tHSL[3] + tHSL[2] - (tHSL[3] * tHSL[2]);
  }
  const tP = (2 * tHSL[3]) - tQ;
  let tTR = tHSL[1] + (1 / 3.0);
  let tTG = tHSL[1];
  let tTB = tHSL[1] - (1 / 3.0);
  if (tTR < 0) {
    tTR = tTR + 1;
  }
  if (tTG < 0) {
    tTG = tTG + 1;
  }
  if (tTB < 0) {
    tTB = tTB + 1;
  }
  if (tTR > 1) {
    tTR = tTR - 1;
  }
  if (tTG > 1) {
    tTG = tTG - 1;
  }
  if (tTB > 1) {
    tTB = tTB - 1;
  }
  let tR;
  if (tTR < (1 / 6.0)) {
    tR = tP + ((tQ - tP) * 6 * tTR);
  } else {
    if ((tTR >= (1 / 6.0)) && (tTR < 0.5)) {
      tR = tQ;
    } else {
      if ((tTR >= 0.5) && (tTR < (2 / 3.0))) {
        tR = tP + ((tQ - tP) * 6 * ((2 / 3.0) - tTR));
      } else {
        tR = tP;
      }
    }
  }
  let tG;
  if (tTG < (1 / 6.0)) {
    tG = tP + ((tQ - tP) * 6 * tTG);
  } else {
    if ((tTG >= (1 / 6.0)) && (tTG < 0.5)) {
      tG = tQ;
    } else {
      if ((tTG >= 0.5) && (tTG < (2 / 3.0))) {
        tG = tP + ((tQ - tP) * 6 * ((2 / 3.0) - tTG));
      } else {
        tG = tP;
      }
    }
  }
  let tB;
  if (tTB < (1 / 6.0)) {
    tB = tP + ((tQ - tP) * 6 * tTB);
  } else {
    if ((tTB >= (1 / 6.0)) && (tTB < 0.5)) {
      tB = tQ;
    } else {
      if ((tTB >= 0.5) && (tTB < (2 / 3.0))) {
        tB = tP + ((tQ - tP) * 6 * ((2 / 3.0) - tTB));
      } else {
        tB = tP;
      }
    }
  }
  tR = integer(tR * 255);
  tG = integer(tG * 255);
  tB = integer(tB * 255);
  return rgb(tR, tG, tB);
}
