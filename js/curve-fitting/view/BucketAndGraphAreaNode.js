// Copyright 2015-2016, University of Colorado Boulder

/**
 * Bucket node and graph area node in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var BucketNode = require( 'CURVE_FITTING/curve-fitting/view/BucketNode' );
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Point = require( 'CURVE_FITTING/curve-fitting/model/Point' );
  var PointNode = require( 'CURVE_FITTING/curve-fitting/view/PointNode' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  /**
   * @param {ObservableArray.<point>} points
   * @param {Bucket} bucket
   * @param {Property.<boolean>} residualsVisibleProperty
   * @param {Property.<boolean>} valuesVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function BucketAndGraphAreaNode( points, bucket, residualsVisibleProperty, valuesVisibleProperty, modelViewTransform ) {

    Node.call( this );

    var self = this;

    // create the bucket node
    var bucketNode = new BucketNode( bucket, modelViewTransform );

    // create a separate layers for all the points
    var pointsNode = new Node();
    // @private
    this.pointsNode = pointsNode;

    // add the children to the screen graph
    this.addChild( bucketNode );
    this.addChild( pointsNode );

    // handle the coming and going of points
    points.addItemAddedListener( function( addedPoint ) {
      var pointNode = new PointNode( addedPoint, residualsVisibleProperty, valuesVisibleProperty, modelViewTransform );
      self.addChild( pointNode );

      points.addItemRemovedListener( function removalListener( removedPoint ) {
        if ( removedPoint === addedPoint ) {
          self.removeChild( pointNode );
          pointNode.dispose();
          points.removeItemRemovedListener( removalListener );
        }
      } );
    } );


    // add drag handler to the bucketNode
    var point = null;
    bucketNode.addInputListener( new SimpleDragHandler( {

      allowTouchSnag: true,

      start: function( event ) {

        // create a point
        var viewPosition = pointsNode.globalToLocalPoint( event.pointer.point );
        var modelPosition = modelViewTransform.viewToModelPosition( viewPosition );
        point = new Point( {
          position: modelPosition,
          dragging: true
        } );

        // add the point to the curve
        points.add( point );
      },

      translate: function( translationParams ) {
        point.position = point.position.plus( modelViewTransform.viewToModelDelta( translationParams.delta ) );
      },

      end: function() {
        point.dragging = false;
        point = null;
      }
    } ) );
  }

  curveFitting.register( 'BucketAndGraphAreaNode', BucketAndGraphAreaNode );

  return inherit( Node, BucketAndGraphAreaNode );
} );