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
  var inherit = require( 'PHET_CORE/inherit' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var ReducedChiSquaredStatisticDialog = require( 'CURVE_FITTING/curve-fitting/view/ReducedChiSquaredStatisticDialog' );
  var RichText = require( 'SCENERY/nodes/RichText' );
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
   * @param {Points} points
   * @param {Property.<number>} chiSquaredProperty
   * @param {Property.<number>} rSquaredProperty
   * @param {Property.<boolean>} curveVisibleProperty
   * @param {Object} [options]
   * @constructor
   */
  function DeviationsAccordionBox( expandedProperty, points, chiSquaredProperty, rSquaredProperty, curveVisibleProperty, options ) {

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
    var barometerX2 = new BarometerX2Node( points, chiSquaredProperty, curveVisibleProperty );

    // r^2 barometer
    var barometerR2 = new BarometerR2Node( rSquaredProperty, curveVisibleProperty );

    // informational dialog, created lazily because Dialog requires sim bounds during construction
    var dialog = null;

    // help button
    var helpButton = new TextPushButton( symbolQuestionMarkString, {
      listener: function() {
        if ( !dialog ) {
          dialog = new ReducedChiSquaredStatisticDialog();
        }
        dialog.show();
      },
      font: TEXT_FONT,
      baseColor: 'rgb( 204, 204, 204 )',
      maxWidth: 40,
      touchAreaXDilation: 8,
      touchAreaYDilation: 8
    } );

    // X^2 value
    var chiSquaredValueNode = new Text( '0.00', {
      font: TEXT_PANEL_FONT,
      textAlign: 'left',
      maxWidth: 22
    } );

    // r^2 value
    var rSquaredValueNode = new Text( '0.00', {
      font: TEXT_PANEL_FONT,
      textAlign: 'left',
      maxWidth: 22
    } );

    var valuesBox = new HBox( {
      spacing: 5,
      resize: false,
      children: [

        //TODO 'X' does not match equation font, not italic
        new RichText( symbolChiString + '<sup>2</sup>=', { font: TEXT_FONT } ),
        new Panel( chiSquaredValueNode, VALUE_PANEL_OPTIONS ),

        //TODO 'r' does not match equation font, not italic
        new RichText( symbolRString + '<sup>2</sup>=', { font: TEXT_FONT } ),
        new Panel( rSquaredValueNode, VALUE_PANEL_OPTIONS )
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

    // unlink unnecessary, present for the lifetime of the sim
    chiSquaredProperty.link( function( chiSquared ) {

      // If chiSquared is greater than 10 we have a bad fit so less precision is needed.
      // If chiSquared if greater than 100 we have a really bad fit and decimals are inconsequential.
      chiSquaredValueNode.setText( formatNumber( chiSquared, 2 ) );
    } );

    // unlink unnecessary, present for the lifetime of the sim
    rSquaredProperty.link( function( rSquared ) {

      // rSquared can only be between 0 and 1 so it will always need 2 decimal points.
      rSquaredValueNode.setText( formatNumber( rSquared, 2 ) );
    } );

    curveVisibleProperty.linkAttribute( rSquaredValueNode, 'visible' );
    curveVisibleProperty.linkAttribute( chiSquaredValueNode, 'visible' );

    AccordionBox.call( this, content, options );
  }

  curveFitting.register( 'DeviationsAccordionBox', DeviationsAccordionBox );

  /**
   * For numbers smaller than ten, returns a number with digits decimal places.
   * For numbers larger than ten, returns a fixed number with (digits + 1) significant figures.
   *
   * @param {number} number
   * @param {number} digits
   * @returns {string}
   */
  function formatNumber( number, digits ) {

    // e.g. for digits = 3
    // 9999.11 -> 9999  (numbers greater than 10^3) are rounded to integers
    // 999.111 -> 999.1
    // 99.1111 -> 99.11
    // 9.11111 -> 9.111 (numbers less than 10) have 3 decimal places
    // 1.11111 -> 1.111
    // 0.11111 -> 0.111
    // 0.01111 -> 0.011
    // 0.00111 -> 0.001
    // 0.00011 -> 0.000

    // number = mantissa times 10^(exponent) where the mantissa is between 1 and 10 (or -1 and -10)
    var exponent = Math.floor( Util.log10( Math.abs( number ) ) );

    var decimalPlaces;
    if ( exponent >= digits ) {
      decimalPlaces = 0;
    }
    else if ( exponent > 0 ) {
      decimalPlaces = digits - exponent;
    }
    else {
      decimalPlaces = digits;
    }

    return Util.toFixed( number, decimalPlaces );
  }

  return inherit( AccordionBox, DeviationsAccordionBox );
} );