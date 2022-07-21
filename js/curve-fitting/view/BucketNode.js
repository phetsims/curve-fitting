// Copyright 2015-2022, University of Colorado Boulder

/**
 * Bucket node with points in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Saurabh Totey
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Bucket from '../../../../phetcommon/js/model/Bucket.js';
import BucketFront from '../../../../scenery-phet/js/bucket/BucketFront.js';
import BucketHole from '../../../../scenery-phet/js/bucket/BucketHole.js';
import { Circle, DragListener, Node } from '../../../../scenery/js/imports.js';
import curveFitting from '../../curveFitting.js';
import CurveFittingConstants from '../CurveFittingConstants.js';
import CurveFittingQueryParameters from '../CurveFittingQueryParameters.js';
import Point from '../model/Point.js';
import PointNode from './PointNode.js';

// constants
const BUCKET_WIDTH = 4.45; // in model coordinates
const BUCKET_HEIGHT = BUCKET_WIDTH * 0.50;
const BUCKET_COLOR = 'rgb( 65, 63, 117 )';

// bucket position is to the left and up from the bottom left corner of graph, in model coordinates
const BUCKET_POSITION_X = CurveFittingConstants.GRAPH_NODE_MODEL_BOUNDS.minX - 1.5;
const BUCKET_POSITION_Y = CurveFittingConstants.GRAPH_NODE_MODEL_BOUNDS.minY + 4;

// position of points inside bucket
const POINT_POSITIONS = [
  { x: -41.25, y: 10 },
  { x: -31.25, y: 12.5 },
  { x: -31.25, y: -1.25 },
  { x: -25, y: 3.75 },
  { x: -23.75, y: -5 },
  { x: -18.75, y: 10 },
  { x: -15, y: -12.5 },
  { x: -12.5, y: -3.75 },
  { x: -6.25, y: 10 },
  { x: -6.25, y: -15 },
  { x: -3.75, y: 12.5 },
  { x: 0, y: -12.5 },
  { x: 2.5, y: -2.5 },
  { x: 6.25, y: 2.5 },
  { x: 6.25, y: 11.25 },
  { x: 12.5, y: -6.25 },
  { x: 10, y: -15 },
  { x: 22.5, y: 2.5 },
  { x: 28.75, y: 11.25 },
  { x: 0, y: 5 },
  { x: 21.25, y: -10 },
  { x: 12.5, y: 11.25 },
  { x: 30, y: -1.25 },
  { x: 18.75, y: 11.25 },
  { x: 15, y: -12.5 },
  { x: 12.5, y: 2.5 },
  { x: -8.75, y: 2.5 },
  { x: 41.25, y: 11.25 },
  { x: 41.25, y: 5 }
];

class BucketNode extends Node {

  /**
   * @param {Points} points
   * @param {function} bumpOutFunction - the function that bumps points out of invalid positions (see #131)
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
          const viewPosition = this.globalToLocalPoint( event.pointer.point );
          point.positionProperty.value = modelViewTransform.viewToModelPosition( viewPosition );
        },

        end: () => {
          bumpOutFunction();
          if ( CurveFittingQueryParameters.snapToGrid ) {
            point.positionProperty.value = new Vector2(
              Utils.toFixedNumber( point.positionProperty.value.x, 0 ),
              Utils.toFixedNumber( point.positionProperty.value.y, 0 )
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

curveFitting.register( 'BucketNode', BucketNode );
export default BucketNode;
