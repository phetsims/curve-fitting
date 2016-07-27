// Copyright 2015-2016, University of Colorado Boulder

/**
 * Deviations accordion box in 'Curve Fitting' simulation.
 * Contains X^2 barometer, r^2 barometer and help button.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var AccordionBox = require( 'SUN/AccordionBox' );
  var BarometerR2Node = require( 'CURVE_FITTING/curve-fitting/view/BarometerR2Node' );
  var BarometerX2Node = require( 'CURVE_FITTING/curve-fitting/view/BarometerX2Node' );
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var HelpDialog = require( 'CURVE_FITTING/curve-fitting/view/HelpDialog' );
  var inherit = require( 'PHET_CORE/inherit' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Util = require( 'DOT/Util' );

  // strings
  var deviationsString = require( 'string!CURVE_FITTING/deviations' );

  // constants
  var TEXT_FONT = new PhetFont( 12 ); //TODO use CurveFittingConstants
  var TEXT_PANEL_FONT = new PhetFont( 10 ); //TODO use CurveFittingConstants
  var VALUE_PANEL_OPTIONS = {
    fill: 'white',
    cornerRadius: 4,
    xMargin: 4,
    yMargin: 4,
    resize: false,
    maxWidth: 30
  };

  // strings
  var symbolRString = require( 'string!CURVE_FITTING/symbol.r' );
  var symbolChiString = require( 'string!CURVE_FITTING/symbol.chi' );
  var symbolQuestionMarkString = require( 'string!CURVE_FITTING/symbol.questionMark' );

  /**
   * @param {Property.<boolean>} expandedProperty - is this panel expanded?
   * @param {Curve} curve
   * @param {Object} [options] for VBox TODO this should be the options for this type!
   * @constructor
   */
  function DeviationsAccordionBox( expandedProperty, curve, options ) {

    options = _.extend( {
      cornerRadius: CurveFittingConstants.PANEL_CORNER_RADIUS,
      fill: CurveFittingConstants.PANEL_BACKGROUND_COLOR,
      maxWidth: CurveFittingConstants.PANEL_MAX_WIDTH,
      expandedProperty: expandedProperty,
      titleNode: new Text( deviationsString, { font: TEXT_FONT } ),
      titleAlignX: 'left',
      showTitleWhenExpanded: true,
      buttonXMargin: 5,
      buttonYMargin: 5,
      contentXMargin: 10,
      contentYMargin: 5,
      buttonTouchAreaXDilation: 8,
      buttonTouchAreaYDilation: 8
    }, options );

    // X^2 barometer
    var barometerX2 = new BarometerX2Node( curve.chiSquareProperty, curve.points );

    // r^2 barometer
    var barometerR2 = new BarometerR2Node( curve.rSquareProperty );

    // help dialog, created on demand
    var helpDialog = null;

    // help button
    var helpButton = new TextPushButton( symbolQuestionMarkString, {
      listener: function() {
        if ( !helpDialog ) {
          helpDialog = new HelpDialog();
        }
        helpDialog.show();
      },
      font: TEXT_FONT,
      baseColor: 'rgb( 204, 204, 204 )',
      maxWidth: 40,
      touchAreaXDilation: 8,
      touchAreaYDilation: 8
    } );

    // X^2 value
    var chiSquareValueNode = new Text( '0.00', {
      font: TEXT_PANEL_FONT,
      textAlign: 'left',
      maxWidth: 22
    } );

    // r^2 value
    var rSquareValueNode = new Text( '0.00', {
      font: TEXT_PANEL_FONT,
      textAlign: 'left'
    } );

    var valuesBox = new HBox( {
      spacing: 5,
      resize: false,
      children: [

        //TODO 'X' does not match equation font, not italic
        new SubSupText( symbolChiString + '<sup>2</sup>=', { font: TEXT_FONT } ),
        new Panel( chiSquareValueNode, VALUE_PANEL_OPTIONS ),

        //TODO 'r' does not match equation font, not italic
        new SubSupText( symbolRString + '<sup>2</sup>=', { font: TEXT_FONT } ),
        new Panel( rSquareValueNode, VALUE_PANEL_OPTIONS )
      ]
    } );

    var barometersBox = new HBox( {
      children: [ barometerX2, barometerR2 ],
      spacing: 10
    } );

    var content = new VBox( {
      align: 'left',
      spacing: 10,
      children: [
        barometersBox,
        valuesBox,
        helpButton
      ]
    } );

    // present for the lifetime of the sim
    curve.chiSquareProperty.link( function( chiSquare ) {
      // if chiSquare is greater than 10 we have a bad fit so less precision is needed
      // if chiSquare if greater than 100 we have a really bad fit and decimals are inconsequential
      chiSquareValueNode.setText( roundNumber( chiSquare, 2 ).numberToString );
    } );

    // present for the lifetime of the sim
    curve.rSquareProperty.link( function( rSquare ) {
      // rSquare can only be between 0 and 1 so it will always need 2 decimal points
      rSquareValueNode.setText( roundNumber( rSquare, 2 ).numberToString );
    } );

    AccordionBox.call( this, content, options );
  }

  curveFitting.register( 'DeviationsAccordionBox', DeviationsAccordionBox );

  /**
   * Returns (for numbers smaller than ten) a number (as a string)  with a fixed number of decimal places
   * whereas for numbers larger than ten, the number/string is returned a fixed number of significant figures
   *
   * @param {number} number
   * @param {number} maxDecimalPlaces
   * @returns {Object}
   */
  function roundNumber( number, maxDecimalPlaces ) {

    // eg. if maxDecimalPlaces = 3
    // 9999.11 -> 9999  (number larger than 10^3) are rounded to unity
    // 999.111 -> 999.1
    // 99.1111 -> 99.11
    // 9.11111 -> 9.111
    // 1.11111 -> 1.111
    // 0.11111 -> 0.111
    // 0.01111 -> 0.011
    // 0.00111 -> 0.001
    // 0.00011 -> 0.000

    var plusString = '\u002B'; // we want a large + sign
    var minusString = '\u2212';

    // number = mantissa times 10^(exponent) where the mantissa is between 1 and 10 (or -1 to -10)
    var exponent = Math.floor( Util.log10( Math.abs( number ) ) );

    var decimalPlaces;
    if ( exponent >= maxDecimalPlaces ) {
      decimalPlaces = 0;
    }
    else if ( exponent > 0 ) {
      decimalPlaces = maxDecimalPlaces - exponent;
    }
    else {
      decimalPlaces = maxDecimalPlaces;
    }
    var roundedNumber = Util.toFixedNumber( number, decimalPlaces );
    var numberToString = Util.toFixed( number, decimalPlaces );
    var signToString = (roundedNumber >= 0) ? plusString : minusString; // N.B.
    var absoluteNumberToString = Util.toFixedNumber( Math.abs( number ), decimalPlaces ); // N.B.
    var isStringZero = (numberToString === Util.toFixed( 0, decimalPlaces ));

    return {
      numberToString: numberToString, // {string}
      signToString: signToString, // {string}
      absoluteNumberToString: absoluteNumberToString, // {string}
      isStringZero: isStringZero  // {boolean}
    };
  }

  return inherit( AccordionBox, DeviationsAccordionBox );
} );