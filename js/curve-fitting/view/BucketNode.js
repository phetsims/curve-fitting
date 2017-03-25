// Copyright 2015-2016, University of Colorado Boulder

/**
 * Bucket node with points in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var BucketFront = require( 'SCENERY_PHET/bucket/BucketFront' );
  var BucketHole = require( 'SCENERY_PHET/bucket/BucketHole' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Point = require( 'CURVE_FITTING/curve-fitting/model/Point' );
  var PointNode = require( 'CURVE_FITTING/curve-fitting/view/PointNode' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  // constants
  var POINT_POSITIONS = [
    { x: -3, y: 10 },
    { x: -25, y: 10 },
    { x: -5, y: 8 },
    { x: -15, y: 8 },
    { x: 10, y: 9 },
    { x: 5, y: 9 },
    { x: 15, y: 9 },
    { x: 23, y: 9 },
    { x: 33, y: 9 },
    { x: -33, y: 8 },
    { x: -25, y: -1 },
    { x: -19, y: -4 },
    { x: 8, y: -12 },
    { x: -10, y: -3 },
    { x: -5, y: -12 },
    { x: 5, y: 2 },
    { x: 2, y: -2 },
    { x: 18, y: 2 },
    { x: 17, y: -8 },
    { x: 0, y: 4 },
    { x: 24, y: -1 },
    { x: -12, y: -10 },
    { x: 0, y: -10 },
    { x: 12, y: -10 },
    { x: 10, y: 2 },
    { x: -7, y: 2 },
    { x: -20, y: 3 },
    { x: 33, y: 4 }
  ];

  /**
   * @param {Bucket} bucket
   * @param {ObservableArray.<point>} points
   * @param {Property.<boolean>} residualsVisibleProperty
   * @param {Property.<boolean>} valuesVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function BucketNode( bucket, points, residualsVisibleProperty, valuesVisibleProperty, modelViewTransform ) {

    Node.call( this );
    var self = this;

    // front of the bucket
    var bucketFrontNode = new BucketFront( bucket, modelViewTransform );

    // back of the bucket
    var bucketHoleNode = new BucketHole( bucket, modelViewTransform );

    // points in the bucket
    var pointsNode = new Node();
    POINT_POSITIONS.forEach( function( position ) {
      pointsNode.addChild( new Circle( {
        fill: CurveFittingConstants.POINT_FILL,
        radius: CurveFittingConstants.POINT_RADIUS,
        stroke: CurveFittingConstants.POINT_STROKE,
        lineWidth: CurveFittingConstants.POINT_LINE_WIDTH,
        x: position.x,
        y: position.y
      } ) );
    } );
    pointsNode.center = bucketHoleNode.center.plusXY( 0, -6 ); // tuned by hand, slightly above bucket

    // add
    this.addChild( bucketHoleNode );
    this.addChild( pointsNode );
    this.addChild( bucketFrontNode );

    // add drag handler to the points
    var point = null;
    pointsNode.addInputListener( new SimpleDragHandler( {

      allowTouchSnag: true,

      start: function( event ) {

        // create a model point
        var viewPosition = self.globalToLocalPoint( event.pointer.point );
        var modelPosition = modelViewTransform.viewToModelPosition( viewPosition );
        point = new Point( {
          position: modelPosition,
          dragging: true
        } );

        // add the model point to the observable array in model curve
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
  }

  curveFitting.register( 'BucketNode', BucketNode );

  return inherit( Node, BucketNode );
} );