// Copyright 2015-2016, University of Colorado Boulder

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
   * @param {Curve} curve - model of curve
   * @param {Property.<number>} orderProperty - order of the polynomial:(1,2,3)
   * @param {Property.<boolean>} equationPanelExpandedProperty
   * @param {Property.<boolean>} curveVisibleProperty
   * @param {Object} [options] for slider node.
   * @constructor
   */
  function EquationGraphPanelNode( curve, orderProperty, equationPanelExpandedProperty, curveVisibleProperty, options ) {
    var boxNode = new HBox( { align: 'bottom' } );
    var titleNode = new Text( equationString, TEXT_OPTIONS );

    // create expand button
    var expandCollapseButton = new ExpandCollapseButton( equationPanelExpandedProperty, {
      sideLength: BUTTON_LENGTH
    } );
    expandCollapseButton.touchArea = expandCollapseButton.localBounds.dilated( BUTTON_LENGTH / 3 );
    expandCollapseButton.mouseArea = expandCollapseButton.localBounds.dilated( BUTTON_LENGTH / 3 );

    // create parameters node
    var yNode = new Text( symbolYString + ' =', TEXT_OPTIONS );
    var aParameterNode = new Text( symbolAString, PARAMETER_TEXT_OPTIONS );
    var aBlockNode = new HBox( {
      align: 'bottom',
      spacing: 2,
      children: [
        aParameterNode,
        new SubSupText( symbolXString + '<sup>3</sup>', TEXT_OPTIONS )
      ]
    } );
    var bParameterNode = new Text( symbolBString, PARAMETER_TEXT_OPTIONS );
    var bBlockNode = new HBox( {
      align: 'bottom',
      spacing: 2,
      children: [
        bParameterNode,
        new SubSupText( symbolXString + '<sup>2</sup>', TEXT_OPTIONS )
      ]
    } );
    var cParameterNode = new Text( symbolCString, PARAMETER_TEXT_OPTIONS );
    var dParameterNode = new Text( symbolDString, PARAMETER_TEXT_OPTIONS );
    var cdBlockNode = new HBox( {
      align: 'bottom',
      spacing: 2,
      children: [
        cParameterNode,
        new Text( symbolXString, TEXT_OPTIONS ),
        dParameterNode
      ]
    } );

    var content = new HBox( {
      spacing: 5,
      children: [ expandCollapseButton, titleNode ]
    } );

    Panel.call( this, content, _.extend( PANEL_OPTIONS, options ) );

    // add observers
    orderProperty.link( function( order ) {
      if ( order === 1 ) {
        boxNode.children = [ yNode, cdBlockNode ];
      }
      else if ( order === 2 ) {
        boxNode.children = [ yNode, bBlockNode, cdBlockNode ];
      }
      else if ( order === 3 ) {
        boxNode.children = [ yNode, aBlockNode, bBlockNode, cdBlockNode ];
      }
    } );

    equationPanelExpandedProperty.link( function( isEquationPanelExpanded ) {
      if ( isEquationPanelExpanded ) {
        content.children = [ expandCollapseButton, boxNode ];
      }
      else {
        content.children = [ expandCollapseButton, titleNode ];
      }
    } );

    // present of the lifetime of the simulation
    curveVisibleProperty.linkAttribute( this, 'visible' );

    var updateAParameter = function() {
      if ( equationPanelExpandedProperty.value && curveVisibleProperty.value ) {
        var numberInfo = roundNumber( curve.aProperty.value, 3 );
        aParameterNode.setText( numberInfo.signToString + numberInfo.absoluteNumberToString );
      }
    };
    curve.aProperty.lazyLink( updateAParameter );
    curveVisibleProperty.lazyLink( updateAParameter );
    equationPanelExpandedProperty.link( updateAParameter );

    var updateBParameter = function() {
      if ( equationPanelExpandedProperty.value && curveVisibleProperty.value ) {
        var numberInfo = roundNumber( curve.bProperty.value, 3 );
        bParameterNode.setText( numberInfo.signToString + numberInfo.absoluteNumberToString );
      }
    };
    curve.bProperty.lazyLink( updateBParameter );
    curveVisibleProperty.lazyLink( updateBParameter );
    equationPanelExpandedProperty.link( updateBParameter );

    var updateCParameter = function() {
      if ( equationPanelExpandedProperty.value && curveVisibleProperty.value ) {
        var numberInfo = roundNumber( curve.cProperty.value, 2 );
        cParameterNode.setText( numberInfo.signToString + numberInfo.absoluteNumberToString );
      }
    };
    curve.cProperty.lazyLink( updateCParameter );
    curveVisibleProperty.lazyLink( updateCParameter );
    equationPanelExpandedProperty.link( updateCParameter );

    var updateDParameter = function() {
      var numberInfo = roundNumber( curve.dProperty.value, 1 );
      dParameterNode.setText( numberInfo.signToString + numberInfo.absoluteNumberToString );
    };
    curve.dProperty.lazyLink( updateDParameter );
    curveVisibleProperty.lazyLink( updateDParameter );
    equationPanelExpandedProperty.link( updateDParameter );

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

      return {
        numberToString: numberToString, // {string}
        signToString: signToString, // {string}
        absoluteNumberToString: absoluteNumberToString, // {string}
        isStringZero: isStringZero  // {boolean}
      };
    }
  }

  curveFitting.register( 'EquationGraphPanelNode', EquationGraphPanelNode );

  return inherit( Panel, EquationGraphPanelNode );
} );