// Copyright 2015-2016, University of Colorado Boulder

/**
 * Bucket node with points in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bucket = require( 'PHETCOMMON/model/Bucket' );
  var BucketFront = require( 'SCENERY_PHET/bucket/BucketFront' );
  var BucketHole = require( 'SCENERY_PHET/bucket/BucketHole' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Point = require( 'CURVE_FITTING/curve-fitting/model/Point' );
  var PointNode = require( 'CURVE_FITTING/curve-fitting/view/PointNode' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var BUCKET_WIDTH = 5; // in model coordinates
  var BUCKET_HEIGHT = BUCKET_WIDTH * 0.50;
  // bucket position is to the left and up from the bottom left corner of graph, in model coordinates
  var BUCKET_POSITION_X = CurveFittingConstants.GRAPH_MODEL_BOUNDS.minX - 3;
  var BUCKET_POSITION_Y = CurveFittingConstants.GRAPH_MODEL_BOUNDS.minY;
  // position of points
  var POINT_POSITIONS = [
    { x: -33, y: 8 },
    { x: -25, y: 10 },
    { x: -25, y: -1 },
    { x: -20, y: 3 },
    { x: -19, y: -4 },
    { x: -15, y: 8 },
    { x: -12, y: -10 },
    { x: -10, y: -3 },
    { x: -5, y: 8 },
    { x: -5, y: -12 },
    { x: -3, y: 10 },
    { x: 0, y: -10 },
    { x: 2, y: -2 },
    { x: 5, y: 2 },
    { x: 5, y: 9 },
    { x: 8, y: -12 },
    { x: 18, y: 2 },
    { x: 23, y: 9 },
    { x: 0, y: 4 },
    { x: 17, y: -8 },
    { x: 10, y: 9 },
    { x: 24, y: -1 },
    { x: 15, y: 9 },
    { x: 12, y: -10 },
    { x: 10, y: 2 },
    { x: -7, y: 2 },
    { x: 33, y: 9 },
    { x: 33, y: 4 }
  ];

  /**
   * @param {Points} points
   * @param {Property.<boolean>} residualsVisibleProperty
   * @param {Property.<boolean>} valuesVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function BucketNode( points, residualsVisibleProperty, valuesVisibleProperty, modelViewTransform ) {

    Node.call( this );
    var self = this;

    // model of the bucket
    var bucket = new Bucket( {
      position: new Vector2( BUCKET_POSITION_X, BUCKET_POSITION_Y ),
      size: new Dimension2( BUCKET_WIDTH, BUCKET_HEIGHT ),
      baseColor: 'rgb( 65, 63, 117 )'
    } );

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

    // add children
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
        point.positionProperty.value = point.positionProperty.value.plus( modelViewTransform.viewToModelDelta( translationParams.delta ) );
      },

      end: function() {
        point.draggingProperty.set( false );
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