// Copyright 2002-2014, University of Colorado Boulder

/**
 * Equation node in adjustable fit node and sliders in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
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

  /**
   * @param {Property.<number>} orderFitProperty parameter to track.
   * @param {number} maxOrderFit - Possible range for property.
   * @param {Object} [options] for slider node.
   * @constructor
   */
  function EquationFitNode( orderFitProperty, maxOrderFit, options ) {
    var self = this;
    var equationTextArray = [];
    var boxNode;

    for ( var i = 1; i < maxOrderFit + 1; i++ ) {
      boxNode = new HBox( { align: 'bottom' } );
      var yNode = new Text( 'y = ', TEXT_OPTIONS );
      boxNode.addChild( yNode );


      // first order of fit
      if ( i > 0 ) {
        boxNode.insertChild( 1, new Text( ' + ', TEXT_OPTIONS ) );
        boxNode.insertChild( 1, new Text( 'x', TEXT_OPTIONS ) );
        boxNode.insertChild( 1, new Text( 'c', PARAMETER_TEXT_OPTIONS ) );

        // second order of fit
        if ( i > 1 ) {
          boxNode.insertChild( 1, new Text( ' + ', TEXT_OPTIONS ) );
          boxNode.insertChild( 1, new SubSupText( 'x<sup>2</sup>', TEXT_OPTIONS ) );
          boxNode.insertChild( 1, new Text( 'b', PARAMETER_TEXT_OPTIONS ) );

          // third order of fit
          if ( i > 2 ) {
            boxNode.insertChild( 1, new Text( ' + ', TEXT_OPTIONS ) );
            boxNode.insertChild( 1, new SubSupText( 'x<sup>3</sup>', TEXT_OPTIONS ) );
            boxNode.insertChild( 1, new Text( 'a', PARAMETER_TEXT_OPTIONS ) );
          }
        }
      }

      boxNode.addChild( new Text( 'd', PARAMETER_TEXT_OPTIONS ) );
      boxNode.localBounds = boxNode.localBounds.withMinX( boxNode.localBounds.minX + yNode.width - 2 );
      equationTextArray.push( boxNode );
    }

    Node.call( this, options );

    // add observer
    orderFitProperty.link( function( orderFit ) {
      self.children = [ equationTextArray[ orderFit - 1 ] ];
    } );
  }

  return inherit( Node, EquationFitNode );
} );