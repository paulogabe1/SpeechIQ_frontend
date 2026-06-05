import 'package:flutter/widgets.dart';

class AppRadius {
  AppRadius._();

  static const Radius extraSmall = Radius.circular(2);
  static const Radius small = Radius.circular(4);
  static const Radius medium = Radius.circular(8);
  static const Radius large = Radius.circular(16);
  static const Radius extraLarge = Radius.circular(24);

  static const BorderRadius extraSmallBorder = BorderRadius.all(extraSmall);
  static const BorderRadius smallBorder = BorderRadius.all(small);
  static const BorderRadius mediumBorder = BorderRadius.all(medium);
  static const BorderRadius largeBorder = BorderRadius.all(large);
  static const BorderRadius extraLargeBorder = BorderRadius.all(extraLarge);

  static const BorderRadius topLarge = BorderRadius.only(
    topLeft: Radius.circular(16),
    topRight: Radius.circular(16),
  );

  static const BorderRadius bottomLarge = BorderRadius.only(
    bottomLeft: Radius.circular(16),
    bottomRight: Radius.circular(16),
  );
}
