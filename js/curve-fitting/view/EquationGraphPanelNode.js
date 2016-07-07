// Copyright 2015, University of Colorado Boulder

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
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Panel = require( 'SUN/Panel' );
  var Text = require( 'SCENERY/nodes/Text' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var Util = require( 'DOT/Util' );

  // strings
  var equationString = require( 'string!CURVE_FITTING/equation' );
  var symbolYString = require( 'string!CURVE_FITTING/symbol.y' );
  var symbolXString = require( 'string!CURVE_FITTING/symbol.x' );
  var symbolAString = require( 'string!CURVE_FITTING/symbol.a' );
  var symbolBString = require( 'string!CURVE_FITTING/symbol.b' );
  var symbolCString = require( 'string!CURVE_FITTING/symbol.c' );
  var symbolDString = require( 'string!CURVE_FITTING/symbol.d' );

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

  /**
   * @param {Property.<boolean>} isEquationPanelExpandedProperty - Property to control equation panel expansion.
   * @param {Curve} curve model.
   * @param {Property.<number>} orderFitProperty parameter to track.
   * @param {Object} [options] for slider node.
   * @constructor
   */
  function EquationGraphPanelNode( isEquationPanelExpandedProperty, curve, orderFitProperty, options ) {
    var boxNode = new HBox( { align: 'bottom' } );
    var titleNode = new Text( equationString, TEXT_OPTIONS );

    // create expand button
    var expandCollapseButton = new ExpandCollapseButton( isEquationPanelExpandedProperty, {
      sideLength: BUTTON_LENGTH
    } );
    expandCollapseButton.touchArea = expandCollapseButton.localBounds.dilatedXY( BUTTON_LENGTH / 3, BUTTON_LENGTH / 3 );
    expandCollapseButton.mouseArea = expandCollapseButton.localBounds.dilatedXY( BUTTON_LENGTH / 3, BUTTON_LENGTH / 3 );

    // create parameters node
    var yNode = new Text( symbolYString + '=', TEXT_OPTIONS );
    var aParameterNode = new Text( symbolAString, PARAMETER_TEXT_OPTIONS );
    var aBlockNode = new HBox( {
      align: 'bottom',
      children: [
        aParameterNode,
        new SubSupText( symbolXString + '<sup>3</sup>', TEXT_OPTIONS ),
        new Text( ' + ', TEXT_OPTIONS )
      ]
    } );
    var bParameterNode = new Text( symbolBString, PARAMETER_TEXT_OPTIONS );
    var bBlockNode = new HBox( {
      align: 'bottom',
      children: [
        bParameterNode,
        new SubSupText( symbolXString + '<sup>2</sup>', TEXT_OPTIONS ),
        new Text( ' + ', TEXT_OPTIONS )
      ]
    } );
    var cParameterNode = new Text( symbolCString, PARAMETER_TEXT_OPTIONS );
    var dParameterNode = new Text( symbolDString, PARAMETER_TEXT_OPTIONS );
    var cdBlockNode = new HBox( {
      align: 'bottom',
      children: [
        cParameterNode,
        new Text( symbolXString, TEXT_OPTIONS ),
        new Text( ' + ', TEXT_OPTIONS ),
        dParameterNode
      ]
    } );

    var content = new HBox( {
      spacing: 5,
      children: [ expandCollapseButton, titleNode ]
    } );

    Panel.call( this, content, _.extend( PANEL_OPTIONS, options ) );

    // add observers
    orderFitProperty.link( function( orderFit ) {
      if ( orderFit === 1 ) {
        boxNode.children = [ yNode, cdBlockNode ];
      }
      else if ( orderFit === 2 ) {
        boxNode.children = [ yNode, bBlockNode, cdBlockNode ];
      }
      else if ( orderFit === 3 ) {
        boxNode.children = [ yNode, aBlockNode, bBlockNode, cdBlockNode ];
      }
    } );

    isEquationPanelExpandedProperty.link( function( isEquationPanelExpanded ) {
      if ( isEquationPanelExpanded ) {
        content.children = [ expandCollapseButton, boxNode ];
      }
      else {
        content.children = [ expandCollapseButton, titleNode ];
      }
    } );

    curve.isVisibleProperty.linkAttribute( this, 'visible' );

    var updateAParameter = function() {
      if ( isEquationPanelExpandedProperty.value && curve.isVisible ) {
        aParameterNode.setText( roundNumber( curve.aProperty.value, 3 ).numberToString );
      }
    };
    curve.aProperty.lazyLink( updateAParameter );
    curve.isVisibleProperty.lazyLink( updateAParameter );
    isEquationPanelExpandedProperty.link( updateAParameter );

    var updateBParameter = function() {
      if ( isEquationPanelExpandedProperty.value && curve.isVisible ) {
        bParameterNode.setText( roundNumber( curve.bProperty.value, 3 ).numberToString );
      }
    };
    curve.bProperty.lazyLink( updateBParameter );
    curve.isVisibleProperty.lazyLink( updateBParameter );
    isEquationPanelExpandedProperty.link( updateBParameter );

    var updateCParameter = function() {
      if ( isEquationPanelExpandedProperty.value && curve.isVisible ) {
        cParameterNode.setText( roundNumber( curve.cProperty.value, 2 ).numberToString );
      }
    };
    curve.cProperty.lazyLink( updateCParameter );
    curve.isVisibleProperty.lazyLink( updateCParameter );
    isEquationPanelExpandedProperty.link( updateCParameter );

    var updateDParameter = function() {
      dParameterNode.setText( roundNumber( curve.dProperty.value, 1 ).numberToString );
    };
    curve.dProperty.lazyLink( updateDParameter );
    curve.isVisibleProperty.lazyLink( updateDParameter );
    isEquationPanelExpandedProperty.link( updateDParameter );


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

      var returnValue = {
        numberToString: numberToString, // {string}
        signToString: signToString, // {string}
        absoluteNumberToString: absoluteNumberToString, // {string}
        isStringZero: isStringZero  // {boolean}
      };

      return returnValue;
    }
  }

  curveFitting.register( 'EquationGraphPanelNode', EquationGraphPanelNode );

  return inherit( Panel, EquationGraphPanelNode );
} );