// Copyright 2015-2018, University of Colorado Boulder

/**
 * Deviations accordion box in 'Curve Fitting' simulation.
 * Contains X^2 barometer, r^2 barometer and help button.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( require => {
  'use strict';

  // modules
  const AccordionBox = require( 'SUN/AccordionBox' );
  const BarometerR2Node = require( 'CURVE_FITTING/curve-fitting/view/BarometerR2Node' );
  const BarometerX2Node = require( 'CURVE_FITTING/curve-fitting/view/BarometerX2Node' );
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const InfoButton = require( 'SCENERY_PHET/buttons/InfoButton' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const ReducedChiSquaredStatisticDialog = require( 'CURVE_FITTING/curve-fitting/view/ReducedChiSquaredStatisticDialog' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Util = require( 'DOT/Util' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const deviationsString = require( 'string!CURVE_FITTING/deviations' );

  // constants
  const TEXT_FONT = new PhetFont( 12 ); //TODO use CurveFittingConstants
  const TEXT_PANEL_FONT = new PhetFont( 10 ); //TODO use CurveFittingConstants
  const VALUE_PANEL_OPTIONS = {
    fill: 'white',
    cornerRadius: 4,
    xMargin: 4,
    yMargin: 4,
    resize: false,
    maxWidth: 30
  };

  // strings
  const symbolChiString = require( 'string!CURVE_FITTING/symbol.chi' );
  const symbolRString = require( 'string!CURVE_FITTING/symbol.r' );

  class DeviationsAccordionBox extends AccordionBox {

    /**
     * @param {Property.<boolean>} expandedProperty - is this panel expanded?
     * @param {Points} points
     * @param {Property.<number>} chiSquaredProperty
     * @param {Property.<number>} rSquaredProperty
     * @param {Property.<boolean>} curveVisibleProperty
     * @param {Object} [options]
     */
    constructor( expandedProperty, points, chiSquaredProperty, rSquaredProperty, curveVisibleProperty, options ) {

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
        expandCollapseButtonOptions: {
          touchAreaXDilation: 8,
          touchAreaYDilation: 8
        }
      }, options );

      // X^2 barometer
      const barometerX2 = new BarometerX2Node( points, chiSquaredProperty, curveVisibleProperty );

      // r^2 barometer
      const barometerR2 = new BarometerR2Node( rSquaredProperty, curveVisibleProperty );

      // informational dialog, created lazily because Dialog requires sim bounds during construction
      let dialog = null;

      // help button
      const helpButton = new InfoButton( {
        listener: () => {
          if ( !dialog ) {
            dialog = new ReducedChiSquaredStatisticDialog();
          }
          dialog.show();
        },
        baseColor: 'rgb( 204, 204, 204 )',
        maxWidth: 30,
        touchAreaXDilation: 8,
        touchAreaYDilation: 8
      } );

      // X^2 value
      const chiSquaredValueNode = new Text( '0.00', {
        font: TEXT_PANEL_FONT,
        textAlign: 'left',
        maxWidth: 22
      } );

      // r^2 value
      const rSquaredValueNode = new Text( '0.00', {
        font: TEXT_PANEL_FONT,
        textAlign: 'left',
        maxWidth: 22
      } );

      const valuesBox = new HBox( {
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

      const barometersBox = new HBox( {
        children: [ barometerX2, barometerR2 ],
        spacing: 15
      } );

      const content = new VBox( {
        align: 'left',
        spacing: 10,
        children: [
          barometersBox,
          valuesBox,
          helpButton
        ]
      } );

      // unlink unnecessary, present for the lifetime of the sim
      chiSquaredProperty.link( chiSquared => {

        // If chiSquared is greater than 10 we have a bad fit so less precision is needed.
        // If chiSquared if greater than 100 we have a really bad fit and decimals are inconsequential.
        chiSquaredValueNode.setText( formatNumber( chiSquared, 2 ) );
      } );

      // unlink unnecessary, present for the lifetime of the sim
      rSquaredProperty.link( rSquared => {

        // rSquared can only be between 0 and 1 so it will always need 2 decimal points.
        rSquaredValueNode.setText( formatNumber( rSquared, 2 ) );
      } );

      curveVisibleProperty.linkAttribute( rSquaredValueNode, 'visible' );
      curveVisibleProperty.linkAttribute( chiSquaredValueNode, 'visible' );

      super( content, options );
    }

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
    const exponent = Math.floor( Util.log10( Math.abs( number ) ) );

    let decimalPlaces;
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

  return DeviationsAccordionBox;
} );