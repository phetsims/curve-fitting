// Copyright 2002-2014, University of Colorado Boulder

/**
 * Bucket node in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var BucketNode = require( 'CURVE_FITTING/curve-fitting/view/BucketNode' );
  var GraphAreaNode = require( 'CURVE_FITTING/curve-fitting/view/GraphAreaNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var PointNode = require( 'CURVE_FITTING/curve-fitting/view/PointNode' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  /**
   * @param {CurveFittingModel} CurveFittingModel
   * @param {Object} options for graph node
   * @constructor
   */
  function BucketAndGraphAreaNode( CurveFittingModel, options ) {
    var self = this;

    // create bucket node
    var bucketNode = new BucketNode();

    // create graph area node
    var graphAreaNode = new GraphAreaNode( CurveFittingModel.curve, CurveFittingModel.orderOfFitProperty,  CurveFittingModel.graphArea );

    HBox.call( this, _.extend( {
      spacing: 40,
      children: [ bucketNode, graphAreaNode ],
      resize: false,
      align: 'bottom'
    }, options ) );

    // add drag handler
    var point = null;
    var pointView = null;
    bucketNode.pointsNode.addInputListener( new SimpleDragHandler( {
      start: function( e ) {
        point = CurveFittingModel.getPoint( e.pointer.point );
        graphAreaNode.setValues( point );
        pointView = new PointNode( point, CurveFittingModel.curve.points, CurveFittingModel.isValuesProperty, self, graphAreaNode );
        self.addChild( pointView );
      },
      drag: function( e ) {
        if ( point ) {
          point.moveTo( e.pointer.point );
          graphAreaNode.setValues( point );
        }
      },
      end: function() {
        if ( graphAreaNode.checkDropPointAndSetValues( point ) ) {
          CurveFittingModel.curve.points.add( point );
        }
        else {
          CurveFittingModel.curve.points.remove( point );
          self.removeChild( pointView );
        }
        point = null;
      }
    } ) );
  }

  return inherit( HBox, BucketAndGraphAreaNode );
} );