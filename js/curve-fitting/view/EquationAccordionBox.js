// Copyright 2015-2019, University of Colorado Boulder

/**
 * EquationAccordionBox is the accordion box that shows the equation of the curve on the graph.
 * It displays 'undefined' if the curve is undefined.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Saurabh Totey
 */
define( require => {
  'use strict';

  // modules
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const EquationNode = require( 'CURVE_FITTING/curve-fitting/view/EquationNode' );
  const Emitter = require( 'AXON/Emitter' );
  const ExpandCollapseButton = require( 'SUN/ExpandCollapseButton' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const MathSymbols = require( 'SCENERY_PHET/MathSymbols' );
  const Panel = require( 'SUN/Panel' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Util = require( 'DOT/Util' );
  const VStrut = require( 'SCENERY/nodes/VStrut' );

  // strings
  const equationString = require( 'string!CURVE_FITTING/equation' );
  const undefinedString = require( 'string!CURVE_FITTING/undefined' );

  // max number of digits for coefficients in ascending order of polynomials
  const MAX_DIGITS = [ 2, 3, 4, 4 ];

  class EquationAccordionBox extends Panel {

    /**
     * @param {Curve} curve
     * @param {Property.<number>} orderProperty - order of the polynomial:(1,2,3)
     * @param {Property.<boolean>} equationPanelExpandedProperty
     * @param {Property.<boolean>} curveVisibleProperty
     * @param {Object} [options] for slider node.
     */
    constructor( curve, orderProperty, equationPanelExpandedProperty, curveVisibleProperty, options ) {

      options = _.extend( {
        equationNodeMaxWidth: 250,
        fill: 'white',
        opacity: 0.8,
        cornerRadius: CurveFittingConstants.PANEL_CORNER_RADIUS,
        xMargin: CurveFittingConstants.PANEL_MARGIN,
        yMargin: CurveFittingConstants.PANEL_MARGIN
      }, options );

      // visible text node when panel is not expanded
      const titleNode = new Text( equationString, {
        font: CurveFittingConstants.ACCORDION_BOX_TITLE_FONT,
        maxWidth: options.equationNodeMaxWidth
      } );

      // create expand button
      const expandCollapseButton = new ExpandCollapseButton( equationPanelExpandedProperty, {
        sideLength: 16
      } );
      expandCollapseButton.touchArea = expandCollapseButton.localBounds.dilated( expandCollapseButton.width / 3 );
      expandCollapseButton.mouseArea = expandCollapseButton.localBounds.dilated( expandCollapseButton.width / 3 );

      // visible node when panel is expanded
      const equationNode = new EquationNode( orderProperty, {
        coefficientSignTextOptions: {
          fill: CurveFittingConstants.BLUE_COLOR
        },
        maxWidth: options.equationNodeMaxWidth
      } );

      // visible node when panel is expanded but there is no equation
      const undefinedEquationText = new Text( undefinedString, {
        font: CurveFittingConstants.ACCORDION_BOX_TITLE_FONT,
        maxWidth: options.equationNodeMaxWidth
      } );

      // So that the panel's height doesn't change.
      const vStrut = new VStrut( equationNode.height );

      const content = new HBox( {
        spacing: 8
      } );

      super( content, options );

      // @public (read-only) is used by the screen view to bump out points from below; see #131
      this.expandCollapseButton = expandCollapseButton;

      // @public an emitter that is fired whenever this panel is updated: is used for background node for #126
      this.updatedEmitter = new Emitter();

      /**
       * This method rounds the given number to the given amount of digits
       * Rounds the number to the nearest whole number if the nearest whole number has as many or more digits than maxDigits
       * Returns an array of two strings: the first string is the number's sign, and the second string is the absolute number
       *
       * @param {number} number
       * @param {number} maxDigits
       * @returns {Array.<string>} - first string is number's sign, second string is number's absolute value
       */
      const getRoundedParameterStrings = ( number, maxDigits ) => {

        // number = mantissa times 10^(exponent) where the mantissa is between 1 and 10 (or -1 to -10)
        const exponent = Math.floor( Util.log10( Math.abs( number ) ) );

        let decimalPlaces;
        if ( exponent >= maxDigits ) {
          decimalPlaces = 0;
        }
        else if ( exponent > 0 ) {
          decimalPlaces = maxDigits - exponent - 1;
        }
        else {
          decimalPlaces = maxDigits - 1;
        }

        const roundedNumber = Util.toFixedNumber( number, decimalPlaces );
        const signToString = ( roundedNumber >= 0 ) ? MathSymbols.PLUS : MathSymbols.MINUS; // N.B.
        const absoluteNumberToString = Util.toFixed( Math.abs( number ), decimalPlaces ); // N.B.

        return [ signToString, absoluteNumberToString ];
      };

      /**
       * updates all the coefficients and panel content
       */
      const updateContent = () => {

        this.visible = curveVisibleProperty.value;

        const coefficientStrings = _.flatMap(
          curve.coefficients,
          ( coefficient, index ) => getRoundedParameterStrings( coefficient, MAX_DIGITS[ index ] )
        );
        equationNode.setCoefficients( coefficientStrings );

        const children = [ expandCollapseButton ];
        if ( equationPanelExpandedProperty.value ) {
          children.push( curve.isCurvePresent() ? equationNode : undefinedEquationText );
        }
        else {
          children.push( titleNode );
        }
        children.push( vStrut );

        content.children = children;

        this.updatedEmitter.emit();

      };

      // add observers which don't need to be disposed because this is present for the lifetime of the simulation
      curveVisibleProperty.link( updateContent );
      equationPanelExpandedProperty.link( updateContent );
      curve.updateCurveEmitter.addListener( updateContent );
      orderProperty.link( updateContent );
    }

  }

  return curveFitting.register( 'EquationAccordionBox', EquationAccordionBox );
} );
