// Copyright 2015-2018, University of Colorado Boulder

//TODO rename, this is an accordion box, not a panel
//TODO this type combines things that should be separate
/**
 * Node with equation parameters in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var ExpandCollapseButton = require( 'SUN/ExpandCollapseButton' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MathSymbols = require( 'SCENERY_PHET/MathSymbols' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RichText = require( 'SCENERY/nodes/RichText' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );

  // strings
  var equationString = require( 'string!CURVE_FITTING/equation' );
  var symbolAString = require( 'string!CURVE_FITTING/symbol.a' );
  var symbolBString = require( 'string!CURVE_FITTING/symbol.b' );
  var symbolCString = require( 'string!CURVE_FITTING/symbol.c' );
  var symbolDString = require( 'string!CURVE_FITTING/symbol.d' );
  var symbolXString = require( 'string!CURVE_FITTING/symbol.x' );
  var symbolYString = require( 'string!CURVE_FITTING/symbol.y' );

  // constants
  var BUTTON_LENGTH = 16;
  var PANEL_OPTIONS = {
    cornerRadius: CurveFittingConstants.PANEL_CORNER_RADIUS,
    fill: 'white'
  };
  var PARAMETER_TEXT_OPTIONS = {
    font: new PhetFont( {
      weight: 'bold',
      size: 12
    } ),
    fill: CurveFittingConstants.BLUE_COLOR
  };
  var TEXT_OPTIONS = { font: new PhetFont( 12 ) };
  //  max number precision decimal places for ascending order of coefficient of polynomials
  var MAX_DECIMALS = [ 1, 2, 3, 3 ];

  /**
   * @param {Function} getCoefficientArray - returns an array of coefficient of the polynomial curve sorted in ascending order {<number>[]}
   * @param {Emitter} updateCurveEmitter
   * @param {Property.<number>} orderProperty - order of the polynomial:(1,2,3)
   * @param {Property.<boolean>} equationPanelExpandedProperty
   * @param {Property.<boolean>} curveVisibleProperty
   * @param {Object} [options] for slider node.
   * @constructor
   */
  function EquationGraphPanelNode( getCoefficientArray,
                                   updateCurveEmitter,
                                   orderProperty,
                                   equationPanelExpandedProperty,
                                   curveVisibleProperty,
                                   options ) {
    var self = this;

    //  visible text node when panel is not expanded
    var titleNode = new Text( equationString, TEXT_OPTIONS );

    //  visible node when panel is expanded
    var boxNode = new HBox( { align: 'bottom' } );

    // create expand button
    var expandCollapseButton = new ExpandCollapseButton( equationPanelExpandedProperty, {
      sideLength: BUTTON_LENGTH
    } );
    expandCollapseButton.touchArea = expandCollapseButton.localBounds.dilated( BUTTON_LENGTH / 3 );
    expandCollapseButton.mouseArea = expandCollapseButton.localBounds.dilated( BUTTON_LENGTH / 3 );

    var content = new HBox( {
      spacing: 5,
      children: [ expandCollapseButton, titleNode ]
    } );

    Panel.call( this, content, _.extend( PANEL_OPTIONS, options ) );

    // convenience array, strings are sorted in ascending order of coefficient of polynomials
    var symbolStrings = [ symbolDString, symbolCString, symbolBString, symbolAString ];

    // text nodes that contain the numerical value of the polynomial coefficients
    // strings are place holders that will be updated by numerical value
    var textNodes = symbolStrings.map( function( symbolString ) {
      return new Text( symbolString, PARAMETER_TEXT_OPTIONS );
    } );

    // blockNode stores all elements of the right hand side of the equation
    var blockNodes = textNodes.map( function( textNode, index ) {
      return self.blockCreatorNode( textNode, index );
    } );

    // create the left hand side of equation ( with equal sign)
    var yNode = new Text( symbolYString + ' =', TEXT_OPTIONS );

    //  update the relevant blocks on the right hand side of equation.
    orderProperty.link( function( order ) {
      // only the relevant orders are shown
      boxNode.children = [ yNode ].concat( blockNodes.slice( 0, order + 1 ).reverse() );
    } );

    // toggle the content of the panel, based on the expansion status
    equationPanelExpandedProperty.link( function( isEquationPanelExpanded ) {
      if ( isEquationPanelExpanded ) {
        content.children = [ expandCollapseButton, boxNode ];
      }
      else {
        content.children = [ expandCollapseButton, titleNode ];
      }
    } );

    // add observer, present of the lifetime of the simulation
    curveVisibleProperty.linkAttribute( this, 'visible' );
    curveVisibleProperty.link( updateCoefficients );
    equationPanelExpandedProperty.link( updateCoefficients );
    updateCurveEmitter.addListener( updateCoefficients );

    /**
     * update the numerical coefficient of a node
     * @param {number} order
     * @param {number} maxDecimalPlaces
     * @param {Text} textNode
     */
    function updateCoefficient( order, maxDecimalPlaces, textNode ) {
      var numberInfo = roundNumber( getCoefficientArray()[ order ], maxDecimalPlaces );
      textNode.setText( numberInfo.signToString + numberInfo.absoluteNumberToString );
    }

    /**
     * update all the coefficients
     */
    function updateCoefficients() {
      textNodes.forEach( function( textNode, index ) {
        updateCoefficient( index, MAX_DECIMALS[ index ], textNode );
      } );
    }

    /**
     * Function that returns (for numbers smaller than ten) a number (as a string)  with a fixed number of decimal places
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
      var signToString = (roundedNumber >= 0) ? MathSymbols.PLUS : MathSymbols.MINUS; // N.B.
      var absoluteNumberToString = Util.toFixed( Math.abs( number ), decimalPlaces ); // N.B.
      var isStringZero = (numberToString === Util.toFixed( 0, decimalPlaces ));

      return {
        numberToString: numberToString, // {string}
        signToString: signToString, // {string}
        absoluteNumberToString: absoluteNumberToString, // {string}
        isStringZero: isStringZero  // {boolean}
      };
    }
  }

  curveFitting.register( 'EquationGraphPanelNode', EquationGraphPanelNode );

  return inherit( Panel, EquationGraphPanelNode, {
    /**
     * returns a hBox containing a numerical value and a polynomial to the power 'order'
     * eg. -4.0 x^3
     * @param {Text} numberText
     * @param {number} order - order of the specific polynomial
     * @returns {HBox}
     * @private
     */
    blockCreatorNode: function( numberText, order ) {
      var polynomialText;
      if ( order === 0 ) {
        polynomialText = new Text( '', TEXT_OPTIONS );
      }
      else if ( order === 1 ) {
        polynomialText = new Text( symbolXString, TEXT_OPTIONS );
      }
      else {
        polynomialText = new RichText( symbolXString + '<sup>' + order + '</sup>', TEXT_OPTIONS );
      }
      return new HBox( {
        align: 'bottom',
        spacing: 2,
        children: [ numberText, polynomialText ]
      } );
    }
  } );
} );