// Copyright 2015-2016, University of Colorado Boulder

/**
 * Bucket view in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var BucketFront = require( 'SCENERY_PHET/bucket/BucketFront' );
  var BucketHole = require( 'SCENERY_PHET/bucket/BucketHole' );

  // constants
  var POINT_POSITIONS = [
    { x: -33, y: 4 },
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
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   * @constructor
   */
  function BucketNode( bucket, modelViewTransform, options ) {

    options = _.extend( {
      cursor: 'pointer'
    }, options );

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
    pointsNode.center = bucketHoleNode.center.addXY( 0, -6 ); // tuned by hand, slightly above bucket

    assert && assert( !options.children, 'decoration not supported' );
    options.children = [ bucketHoleNode, pointsNode, bucketFrontNode ];

    Node.call( this, options );
  }

  curveFitting.register( 'BucketNode', BucketNode );

  return inherit( Node, BucketNode );
} );