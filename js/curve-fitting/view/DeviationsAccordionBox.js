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
  const MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const ReducedChiSquaredStatisticDialog = require( 'CURVE_FITTING/curve-fitting/view/ReducedChiSquaredStatisticDialog' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Util = require( 'DOT/Util' );

  // strings
  const deviationsString = require( 'string!CURVE_FITTING/deviations' );

  // constants
  const TEXT_FONT = new PhetFont( 12 );
  const VALUES_TEXT_FONT = new PhetFont( 10 );
  const MATH_FONT = new MathSymbolFont( 12 );
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

      const panelContent = new Node( { width: options.maxWidth } );

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
      const chiSquaredValueText = new Text( '0.00', {
        font: VALUES_TEXT_FONT,
        textAlign: 'left',
        maxWidth: 22
      } );
      const chiSquaredValuePanel = new Panel( chiSquaredValueText, VALUE_PANEL_OPTIONS );
      const chiSquaredLabelText = new RichText( symbolChiString + '<sup>2</sup>=', { font: MATH_FONT } );
      const chiSquaredInformationBox = new HBox( {
        children: [ chiSquaredLabelText, chiSquaredValuePanel ]
      } );

      // r^2 value
      const rSquaredValueText = new Text( '0.00', {
        font: VALUES_TEXT_FONT,
        textAlign: 'left',
        maxWidth: 22
      } );
      const rSquaredValuePanel = new Panel( rSquaredValueText, VALUE_PANEL_OPTIONS );
      const rSquaredLabelText = new RichText( symbolRString + '<sup>2</sup>=', { font: MATH_FONT } );
      const rSquaredInformationBox = new HBox( {
        children: [ rSquaredLabelText, rSquaredValuePanel ]
      } );

      // unlink unnecessary, present for the lifetime of the sim
      chiSquaredProperty.link( chiSquared => {

        // If chiSquared is greater than 10 we have a bad fit so less precision is needed.
        // If chiSquared if greater than 100 we have a really bad fit and decimals are inconsequential.
        chiSquaredValueText.setText( formatNumber( chiSquared, 2 ) );
      } );

      // unlink unnecessary, present for the lifetime of the sim
      rSquaredProperty.link( rSquared => {

        // rSquared can only be between 0 and 1 so it will always need 2 decimal points.
        rSquaredValueText.setText( formatNumber( rSquared, 2 ) );
      } );

      curveVisibleProperty.linkAttribute( rSquaredValueText, 'visible' );
      curveVisibleProperty.linkAttribute( chiSquaredValueText, 'visible' );

      panelContent.addChild( helpButton );
      panelContent.addChild( chiSquaredInformationBox );
      panelContent.addChild( rSquaredInformationBox );
      panelContent.addChild( barometerX2 );
      panelContent.addChild( barometerR2 );

      helpButton.centerX = panelContent.width / 2;
      chiSquaredInformationBox.right = helpButton.centerX - 5;
      chiSquaredInformationBox.bottom = helpButton.top - 5;
      rSquaredInformationBox.left = helpButton.centerX + 5;
      rSquaredInformationBox.bottom = helpButton.top - 5;
      barometerX2.centerX = chiSquaredInformationBox.centerX;
      barometerR2.centerX = rSquaredInformationBox.centerX;
      barometerX2.bottom = chiSquaredInformationBox.top - 5;
      barometerR2.bottom = rSquaredInformationBox.top - 5;

      super( panelContent, options );
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