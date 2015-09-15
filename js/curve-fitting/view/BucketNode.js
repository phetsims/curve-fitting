// Copyright 2002-2014, University of Colorado Boulder

/**
 * Bucket node view in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var Circle = require( 'SCENERY/nodes/Circle' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var BucketFront = require( 'SCENERY_PHET/bucket/BucketFront' );
  var BucketHole = require( 'SCENERY_PHET/bucket/BucketHole' );

  // constants
  var POINTS_COORDS = [
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
   * @param {SphereBucket} bucketModel - Model of bucket.
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options] for graph node
   * @constructor
   */
  function BucketNode( bucketModel, modelViewTransform, options ) {
    Node.call( this, _.extend( { cursor: 'pointer' }, options ) );

    var bucketNode = new BucketFront( bucketModel, modelViewTransform );
    bucketNode.rotate( Math.PI );

    var bucketHoleNode = new BucketHole( bucketModel, modelViewTransform );
    bucketHoleNode.rotate( Math.PI );

    // create points
    var pointsNode = new Node();
    POINTS_COORDS.forEach( function( pointsCoord ) {
      pointsNode.addChild( new Circle( {
        fill: CurveFittingConstants.POINT_FILL,
        radius: CurveFittingConstants.POINT_RADIUS,
        stroke: CurveFittingConstants.POINT_STROKE,
        lineWidth: CurveFittingConstants.POINT_LINE_WIDTH,
        x: pointsCoord.x,
        y: pointsCoord.y
      } ) );
    } );
    pointsNode.center = bucketHoleNode.center.copy();
    pointsNode.translate( 0, -6 ); // tuned by hand to place point slightly above bucket

    this.addChild( bucketHoleNode );
    this.addChild( pointsNode );
    this.addChild( bucketNode );

    // expand touch area
    var clickableRadius = Math.max( this.bounds.width, this.bounds.height ) / 2;
    this.addChild( new Circle( {
      opacity: 0,
      fill: 'red',
      radius: clickableRadius
    } ) );
  }

  return inherit( Node, BucketNode );
} );