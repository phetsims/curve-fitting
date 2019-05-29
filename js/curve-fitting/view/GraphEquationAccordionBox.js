// Copyright 2015-2018, University of Colorado Boulder

//TODO this type combines things that should be separate
/**
 * Node with equation parameters in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Saurabh Totey
 */
define( require => {
  'use strict';

  // modules
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const ExpandCollapseButton = require( 'SUN/ExpandCollapseButton' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  const MathSymbols = require( 'SCENERY_PHET/MathSymbols' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Util = require( 'DOT/Util' );

  // strings
  const equationString = require( 'string!CURVE_FITTING/equation' );
  const symbolAString = require( 'string!CURVE_FITTING/symbol.a' );
  const symbolBString = require( 'string!CURVE_FITTING/symbol.b' );
  const symbolCString = require( 'string!CURVE_FITTING/symbol.c' );
  const symbolDString = require( 'string!CURVE_FITTING/symbol.d' );
  const symbolXString = require( 'string!CURVE_FITTING/symbol.x' );
  const symbolYString = require( 'string!CURVE_FITTING/symbol.y' );

  // constants
  const BUTTON_LENGTH = 16;
  const PANEL_OPTIONS = {
    cornerRadius: CurveFittingConstants.PANEL_CORNER_RADIUS,
    fill: 'white'
  };
  const PARAMETER_TEXT_OPTIONS = {
    font: new PhetFont( {
      weight: 'bold',
      size: 12
    } ),
    fill: CurveFittingConstants.BLUE_COLOR
  };
  const TEXT_OPTIONS = { font: new PhetFont( 12 ) };
  const VARIABLE_TEXT_OPTIONS = { font: new MathSymbolFont( 12 ) };
  //  max number precision decimal places for ascending order of coefficient of polynomials
  const MAX_DECIMALS = [ 1, 2, 3, 3 ];

  class GraphEquationAccordionBox extends Panel {

    /**
     * @param {Function} getCoefficientArray - returns an array of coefficient of the polynomial curve sorted in ascending order {<number>[]}
     * @param {Emitter} updateCurveEmitter
     * @param {Property.<number>} orderProperty - order of the polynomial:(1,2,3)
     * @param {Property.<boolean>} equationPanelExpandedProperty
     * @param {Property.<boolean>} curveVisibleProperty
     * @param {Object} [options] for slider node.
     */
    constructor( getCoefficientArray,
                                     updateCurveEmitter,
                                     orderProperty,
                                     equationPanelExpandedProperty,
                                     curveVisibleProperty,
                                     options ) {

      //  visible text node when panel is not expanded
      const titleNode = new Text( equationString, TEXT_OPTIONS );

      //  visible node when panel is expanded
      const boxNode = new HBox( { align: 'bottom' } );

      // create expand button
      const expandCollapseButton = new ExpandCollapseButton( equationPanelExpandedProperty, {
        sideLength: BUTTON_LENGTH
      } );
      expandCollapseButton.touchArea = expandCollapseButton.localBounds.dilated( BUTTON_LENGTH / 3 );
      expandCollapseButton.mouseArea = expandCollapseButton.localBounds.dilated( BUTTON_LENGTH / 3 );

      const content = new HBox( {
        spacing: 5,
        children: [ expandCollapseButton, titleNode ]
      } );

      super( content, _.extend( PANEL_OPTIONS, options ) );

      // convenience array, strings are sorted in ascending order of coefficient of polynomials
      const symbolStrings = [ symbolDString, symbolCString, symbolBString, symbolAString ];

      // text nodes that contain the signs and numerical values of the polynomial coefficients
      // strings are place holders that will be updated by numerical value
      const textNodes = symbolStrings.map(
        symbolString => [ new Text( MathSymbols.PLUS, TEXT_OPTIONS ), new Text( symbolString, PARAMETER_TEXT_OPTIONS ) ]
      ).flat();

      // blockNode stores all elements of the right hand side of the equation
      const blockNodes = [];
      for ( let i = 0; i < 4; i++ ) {
        blockNodes.push( this.createPolynomialHBox( textNodes[ i * 2 ], textNodes[ i * 2 + 1 ], i ) );
      }

      // create the left hand side of equation ( with equal sign)
      const yNode = new Text( symbolYString + ' = ', TEXT_OPTIONS );

      //  update the relevant blocks on the right hand side of equation.
      orderProperty.link( order => {
        // only the relevant orders are shown
        boxNode.children = [ yNode ].concat( blockNodes.slice( 0, order + 1 ).reverse() );
      } );

      // toggle the content of the panel, based on the expansion status
      equationPanelExpandedProperty.link( isEquationPanelExpanded => {
        if ( isEquationPanelExpanded ) {
          content.children = [ expandCollapseButton, boxNode ];
        }
        else {
          content.children = [ expandCollapseButton, titleNode ];
        }
      } );

      /**
       * Function that returns (for numbers smaller than ten) a number (as a string)  with a fixed number of decimal places
       * whereas for numbers larger than ten, the number/string is returned a fixed number of significant figures
       *
       * @param {number} number
       * @param {number} maxDecimalPlaces
       * @returns {Object}
       */
      const roundNumber = ( number, maxDecimalPlaces ) => {

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

        // number = mantissa times 10^(exponent) where the mantissa is between 1 and 10 (or -1 to -10)
        const exponent = Math.floor( Util.log10( Math.abs( number ) ) );

        let decimalPlaces;
        if ( exponent >= maxDecimalPlaces ) {
          decimalPlaces = 0;
        }
        else if ( exponent > 0 ) {
          decimalPlaces = maxDecimalPlaces - exponent;
        }
        else {
          decimalPlaces = maxDecimalPlaces;
        }
        const roundedNumber = Util.toFixedNumber( number, decimalPlaces );
        const numberToString = Util.toFixed( number, decimalPlaces );
        const signToString = (roundedNumber >= 0) ? MathSymbols.PLUS : MathSymbols.MINUS; // N.B.
        const absoluteNumberToString = Util.toFixed( Math.abs( number ), decimalPlaces ); // N.B.
        const isStringZero = (numberToString === Util.toFixed( 0, decimalPlaces ));

        return {
          numberToString: numberToString, // {string}
          signToString: signToString, // {string}
          absoluteNumberToString: absoluteNumberToString, // {string}
          isStringZero: isStringZero  // {boolean}
        };
      };

      /**
       * update the numerical coefficient of a node
       * @param {number} order
       * @param {number} maxDecimalPlaces
       * @param {Text} signTextNode
       * @param {Text} coefficientTextNode
       */
      const updateCoefficient = ( order, maxDecimalPlaces, signTextNode, coefficientTextNode ) => {
        const numberInfo = roundNumber( getCoefficientArray()[ order ], maxDecimalPlaces );

        // change a '+' to a '' if the sign is for a leading coefficient (eg. +3x^3 + ... -> 3x^3 + ...)
        let signToString = numberInfo.signToString;
        if ( order === orderProperty.value && signToString === MathSymbols.PLUS ) {
          signToString = '';
        }

        signTextNode.text = signToString;
        coefficientTextNode.text = numberInfo.absoluteNumberToString;
      };

      /**
       * update all the coefficients
       */
      const updateCoefficients = () => {
        for ( let i = 0; i < 4; i++ ) {
          updateCoefficient( i, MAX_DECIMALS[ i ], textNodes[ i * 2 ], textNodes[ i * 2 + 1 ] );
        }
      };

      // add observer, present of the lifetime of the simulation
      curveVisibleProperty.linkAttribute( this, 'visible' );
      curveVisibleProperty.link( updateCoefficients );
      equationPanelExpandedProperty.link( updateCoefficients );
      updateCurveEmitter.addListener( updateCoefficients );
    }

    /**
     * returns a hBox containing a numerical coefficient and a polynomial to the power 'order'
     * eg. -4.0 x^3
     * @param {Text} coefficientSignText
     * @param {Text} coefficientText
     * @param {number} order - order of the specific polynomial
     * @returns {HBox}
     * @private
     */
    createPolynomialHBox( coefficientSignText, coefficientText, order ) {
      let polynomialText;
      if ( order === 0 ) {
        polynomialText = new Text( '', VARIABLE_TEXT_OPTIONS );
      }
      else if ( order === 1 ) {
        polynomialText = new Text( symbolXString + ' ', VARIABLE_TEXT_OPTIONS );
      }
      else {
        polynomialText = new RichText( symbolXString + '<sup>' + order + '</sup> ', VARIABLE_TEXT_OPTIONS );
      }
      return new HBox( {
        align: 'bottom',
        spacing: 2,
        children: [ coefficientSignText, coefficientText, polynomialText ]
      } );
    }

  }

  curveFitting.register( 'GraphEquationAccordionBox', GraphEquationAccordionBox );

  return GraphEquationAccordionBox;
} );