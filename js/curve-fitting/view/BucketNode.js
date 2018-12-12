// Copyright 2015-2018, University of Colorado Boulder

//TODO #121 determine if this can be replaced with SCENERY_PHET/BucketFront and SCENERY_PHET/BucketHole
/**
 * Bucket node with points in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
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
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Point = require( 'CURVE_FITTING/curve-fitting/model/Point' );
  const PointNode = require( 'CURVE_FITTING/curve-fitting/view/PointNode' );
  const SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  const Util = require( 'DOT/Util' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const BUCKET_WIDTH = 5; // in model coordinates
  const BUCKET_HEIGHT = BUCKET_WIDTH * 0.50;
  // bucket position is to the left and up from the bottom left corner of graph, in model coordinates
  const BUCKET_POSITION_X = CurveFittingConstants.GRAPH_MODEL_BOUNDS.minX - 3;
  const BUCKET_POSITION_Y = CurveFittingConstants.GRAPH_MODEL_BOUNDS.minY;
  // position of points
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

    // model of the bucket
    const bucket = new Bucket( {
      position: new Vector2( BUCKET_POSITION_X, BUCKET_POSITION_Y ),
      size: new Dimension2( BUCKET_WIDTH, BUCKET_HEIGHT ),
      baseColor: 'rgb( 65, 63, 117 )'
    } );

    // front of the bucket
    const bucketFrontNode = new BucketFront( bucket, modelViewTransform );

    // back of the bucket
    const bucketHoleNode = new BucketHole( bucket, modelViewTransform );

    /**
     * create a drag handler that adds a point to the model
     * @returns {SimpleDragHandler}
     */
    const createDragHandler = () => {
      let point = null;
      const dragHandler = new SimpleDragHandler( {

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
        },

        translate: translationParams => {
          point.positionProperty.value = point.positionProperty.value.plus( modelViewTransform.viewToModelDelta( translationParams.delta ) );
        },

        end: () => {
          if ( CurveFittingQueryParameters.snapToGrid ) {
            point.positionProperty.set( new Vector2(
              Util.toFixedNumber( point.positionProperty.value.x, 1 ),
              Util.toFixedNumber( point.positionProperty.value.y, 1 )
            ) );
          }
          point.draggingProperty.set( false );
          point = null;
        }
      } );

      return dragHandler;
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
        y: position.y
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
      const pointNode = new PointNode( addedPoint, residualsVisibleProperty, valuesVisibleProperty, modelViewTransform );
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

  curveFitting.register( 'BucketNode', BucketNode );

  return inherit( Node, BucketNode );
} );