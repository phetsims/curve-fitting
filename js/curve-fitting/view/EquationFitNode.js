// Copyright 2015-2018, University of Colorado Boulder

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
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const inherit = require( 'PHET_CORE/inherit' );
  const MathSymbols = require( 'SCENERY_PHET/MathSymbols' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const Text = require( 'SCENERY/nodes/Text' );

  // constants
  const TEXT_OPTIONS = { font: new PhetFont( 12 ) };
  const PARAMETER_TEXT_OPTIONS = {
    font: new PhetFont( {
      weight: 'bold',
      size: 12
    } ),
    fill: CurveFittingConstants.BLUE_COLOR
  };

  // strings
  const symbolAString = require( 'string!CURVE_FITTING/symbol.a' );
  const symbolBString = require( 'string!CURVE_FITTING/symbol.b' );
  const symbolCString = require( 'string!CURVE_FITTING/symbol.c' );
  const symbolDString = require( 'string!CURVE_FITTING/symbol.d' );
  const symbolXString = require( 'string!CURVE_FITTING/symbol.x' );
  const symbolYString = require( 'string!CURVE_FITTING/symbol.y' );

  /**
   * @param {Property.<number>} orderFitProperty parameter to track.
   * @param {Object} [options] for slider node.
   * @constructor
   */
  function EquationFitNode( orderFitProperty, options ) {
    const equationTextArray = [];
    let boxNode;

    for ( let i = 1; i < CurveFittingConstants.MAX_ORDER_OF_FIT + 1; i++ ) {
      boxNode = new HBox( { align: 'bottom' } );
      const yNode = new Text( symbolYString + ' ' + MathSymbols.EQUAL_TO, TEXT_OPTIONS );
      boxNode.addChild( yNode );

      // first order of fit
      if ( i > 0 ) {
        boxNode.insertChild( 1, new Text( MathSymbols.PLUS + ' ', TEXT_OPTIONS ) );
        boxNode.insertChild( 1, new Text( symbolXString, TEXT_OPTIONS ) );
        boxNode.insertChild( 1, new Text( symbolCString, PARAMETER_TEXT_OPTIONS ) );

        // second order of fit
        if ( i > 1 ) {
          boxNode.insertChild( 1, new Text( MathSymbols.PLUS + ' ', TEXT_OPTIONS ) );
          boxNode.insertChild( 1, new RichText( symbolXString + '<sup>2</sup>', TEXT_OPTIONS ) );
          boxNode.insertChild( 1, new Text( symbolBString, PARAMETER_TEXT_OPTIONS ) );

          // third order of fit
          if ( i > 2 ) {
            boxNode.insertChild( 1, new Text( MathSymbols.PLUS + ' ', TEXT_OPTIONS ) );
            boxNode.insertChild( 1, new RichText( symbolXString + '<sup>3</sup>', TEXT_OPTIONS ) );
            boxNode.insertChild( 1, new Text( symbolAString, PARAMETER_TEXT_OPTIONS ) );
          }
        }
      }

      boxNode.addChild( new Text( symbolDString, PARAMETER_TEXT_OPTIONS ) );
      equationTextArray.push( boxNode );
    }

    Node.call( this, options );

    // add observer
    orderFitProperty.link( orderFit => {
      this.children = [ equationTextArray[ orderFit - 1 ] ];
    } );
  }

  curveFitting.register( 'EquationFitNode', EquationFitNode );

  return inherit( Node, EquationFitNode );
} );