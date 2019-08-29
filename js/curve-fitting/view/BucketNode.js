// Copyright 2015-2019, University of Colorado Boulder

/**
 * Bucket node with points in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Saurabh Totey
 */
define( require => {
  'use strict';

  // modules
  const Bucket = require( 'PHETCOMMON/model/Bucket' );
  const BucketFront = require( 'SCENERY_PHET/bucket/BucketFront' );
  const BucketHole = require( 'SCENERY_PHET/bucket/BucketHole' );
  const Circle = require( 'SCENERY/nodes/Circle' );
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const CurveFittingQueryParameters = require( 'CURVE_FITTING/curve-fitting/CurveFittingQueryParameters' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const DragListener = require( 'SCENERY/listeners/DragListener' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Point = require( 'CURVE_FITTING/curve-fitting/model/Point' );
  const PointNode = require( 'CURVE_FITTING/curve-fitting/view/PointNode' );
  const Util = require( 'DOT/Util' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const BUCKET_WIDTH = 5; // in model coordinates
  const BUCKET_HEIGHT = BUCKET_WIDTH * 0.50;
  const BUCKET_COLOR = 'rgb( 65, 63, 117 )';

  // bucket position is to the left and up from the bottom left corner of graph, in model coordinates
  const BUCKET_POSITION_X = CurveFittingConstants.GRAPH_NODE_MODEL_BOUNDS.minX - 1.5;
  const BUCKET_POSITION_Y = CurveFittingConstants.GRAPH_NODE_MODEL_BOUNDS.minY + 4;

  // position of points inside bucket
  const POINT_POSITIONS = [
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
    { x: 10, y: -5 },
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

  class BucketNode extends Node {

    /**
     * @param {Points} points
     * @param {function} bumpOutFunction - the function that bumps points out of invalid locations (see #131)
     * @param {Property.<boolean>} residualsVisibleProperty
     * @param {Property.<boolean>} valuesVisibleProperty
     * @param {ModelViewTransform2} modelViewTransform
     */
    constructor( points, bumpOutFunction, residualsVisibleProperty, valuesVisibleProperty, modelViewTransform ) {
      super();

      // model of the bucket
      const bucket = new Bucket( {
        position: new Vector2( BUCKET_POSITION_X, BUCKET_POSITION_Y ),
        size: new Dimension2( BUCKET_WIDTH, BUCKET_HEIGHT ),
        baseColor: BUCKET_COLOR
      } );

      // front of the bucket
      const bucketFrontNode = new BucketFront( bucket, modelViewTransform );

      // back of the bucket
      const bucketHoleNode = new BucketHole( bucket, modelViewTransform );

      // an array that records which points are being interacted with currently
      // used by points to determine when they should display their halos (see #133)
      const currentlyInteractingPoints = [];

      /**
       * creates a drag listener that adds a point to the model
       * @returns {DragListener}
       */
      const createDragHandler = () => {
        let point = null;
        return new DragListener( {

          allowTouchSnag: true,

          start: event => {

            // create a model point
            const viewPosition = this.globalToLocalPoint( event.pointer.point );
            const modelPosition = modelViewTransform.viewToModelPosition( viewPosition );
            point = new Point( {
              position: modelPosition,
              dragging: true
            } );

            // add the model point to the observable array in model curve
            points.add( point );

            currentlyInteractingPoints.push( point );
          },

          drag: event => {
            const viewLocation = this.globalToLocalPoint( event.pointer.point );
            point.positionProperty.value = modelViewTransform.viewToModelPosition( viewLocation );
          },

          end: () => {
            bumpOutFunction();
            if ( CurveFittingQueryParameters.snapToGrid ) {
              point.positionProperty.value = new Vector2(
                Util.toFixedNumber( point.positionProperty.value.x, 0 ),
                Util.toFixedNumber( point.positionProperty.value.y, 0 )
              );
            }
            currentlyInteractingPoints.splice( currentlyInteractingPoints.indexOf( point ), 1 );
            point.draggingProperty.value = false;
            point = null;
          }
        } );
      };

      // points in the bucket
      const pointsNode = new Node();
      POINT_POSITIONS.forEach( position => {
        const circle = new Circle( {
          fill: CurveFittingConstants.POINT_FILL,
          radius: CurveFittingConstants.POINT_RADIUS,
          stroke: CurveFittingConstants.POINT_STROKE,
          lineWidth: CurveFittingConstants.POINT_LINE_WIDTH,
          x: position.x,
          y: position.y,
          cursor: 'pointer'
        } );
        circle.addInputListener( createDragHandler() );
        pointsNode.addChild( circle );
      } );

      pointsNode.center = bucketHoleNode.center.plusXY( 0, -6 ); // tuned by hand, slightly above bucket

      // add children, the z-order is critical here.
      this.addChild( bucketHoleNode );
      this.addChild( pointsNode );
      this.addChild( bucketFrontNode );

      // handle the coming and going of points
      points.addItemAddedListener( addedPoint => {
        const pointNode = new PointNode(
          addedPoint,
          bumpOutFunction,
          currentlyInteractingPoints,
          residualsVisibleProperty,
          valuesVisibleProperty,
          modelViewTransform
        );
        this.addChild( pointNode );

        const removalListener = removedPoint => {
          if ( removedPoint === addedPoint ) {
            this.removeChild( pointNode );
            pointNode.dispose();
            points.removeItemRemovedListener( removalListener );
          }
        };
        points.addItemRemovedListener( removalListener );
      } );
    }

  }

  return curveFitting.register( 'BucketNode', BucketNode );
} );
