// Copyright 2015-2016, University of Colorado Boulder

//TODO rename, this is the controls for adjustable fit
//TODO spacing of equation looks awful
/**
 * Equation node in adjustable fit node and sliders in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var TEXT_OPTIONS = { font: new PhetFont( 12 ) };
  var PARAMETER_TEXT_OPTIONS = {
    font: new PhetFont( {
      weight: 'bold',
      size: 12
    } ),
    fill: CurveFittingConstants.BLUE_COLOR
  };

  // strings
  var symbolPlusString = require( 'string!CURVE_FITTING/symbol.plus' );
  var symbolYString = require( 'string!CURVE_FITTING/symbol.y' );
  var symbolXString = require( 'string!CURVE_FITTING/symbol.x' );
  var symbolAString = require( 'string!CURVE_FITTING/symbol.a' );
  var symbolBString = require( 'string!CURVE_FITTING/symbol.b' );
  var symbolCString = require( 'string!CURVE_FITTING/symbol.c' );
  var symbolDString = require( 'string!CURVE_FITTING/symbol.d' );

  /**
   * @param {Property.<number>} orderFitProperty parameter to track.
   * @param {Object} [options] for slider node.
   * @constructor
   */
  function EquationFitNode( orderFitProperty, options ) {
    var self = this;
    var equationTextArray = [];
    var boxNode;

    for ( var i = 1; i < CurveFittingConstants.MAX_ORDER_OF_FIT + 1; i++ ) {
      boxNode = new HBox( { align: 'bottom' } );
      var yNode = new Text( symbolYString + ' =', TEXT_OPTIONS );
      boxNode.addChild( yNode );

      // first order of fit
      if ( i > 0 ) {
        boxNode.insertChild( 1, new Text( symbolPlusString + ' ', TEXT_OPTIONS ) );
        boxNode.insertChild( 1, new Text( symbolXString, TEXT_OPTIONS ) );
        boxNode.insertChild( 1, new Text( symbolCString, PARAMETER_TEXT_OPTIONS ) );

        // second order of fit
        if ( i > 1 ) {
          boxNode.insertChild( 1, new Text( symbolPlusString + ' ', TEXT_OPTIONS ) );
          boxNode.insertChild( 1, new SubSupText( symbolXString + '<sup>2</sup>', TEXT_OPTIONS ) );
          boxNode.insertChild( 1, new Text( symbolBString, PARAMETER_TEXT_OPTIONS ) );

          // third order of fit
          if ( i > 2 ) {
            boxNode.insertChild( 1, new Text( symbolPlusString + ' ', TEXT_OPTIONS ) );
            boxNode.insertChild( 1, new SubSupText( symbolXString + '<sup>3</sup>', TEXT_OPTIONS ) );
            boxNode.insertChild( 1, new Text( symbolAString, PARAMETER_TEXT_OPTIONS ) );
          }
        }
      }

      boxNode.addChild( new Text( symbolDString, PARAMETER_TEXT_OPTIONS ) );
      equationTextArray.push( boxNode );
    }

    Node.call( this, options );

    // add observer
    orderFitProperty.link( function( orderFit ) {
      self.children = [ equationTextArray[ orderFit - 1 ] ];
    } );
  }

  curveFitting.register( 'EquationFitNode', EquationFitNode );

  return inherit( Node, EquationFitNode );
} );