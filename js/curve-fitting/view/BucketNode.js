// Copyright 2002-2014, University of Colorado Boulder

/**
 * Bucket node in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var Circle = require( 'SCENERY/nodes/Circle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Shape = require( 'KITE/Shape' );

  // constants
  var POINTS_COORDS = [
    { x: -33, y: 8 },
    { x: -25, y: 3 },
    { x: -19, y: 0 },
    { x: 8, y: -8 },
    { x: -10, y: 1 },
    { x: -5, y: -8 },
    { x: 5, y: 6 },
    { x: 2, y: 2 },
    { x: 18, y: 6 },
    { x: 17, y: -4 },
    { x: 0, y: 8 },
    { x: 24, y: 3 },
    { x: -12, y: -6 },
    { x: 0, y: -6 },
    { x: 12, y: -6 },
    { x: 10, y: 6 },
    { x: -7, y: 6 },
    { x: -20, y: 7 },
    { x: 33, y: 8 }
  ];
  var POINT_OPTIONS = {
    fill: 'rgb( 252, 151, 64 )',
    radius: 6,
    stroke: 'black',
    lineWidth: 1
  };
  var RADIUS_X = 44;
  var RADIUS_Y = 9;

  /**
   * @param {CurveFittingModel} CurveFittingModel
   * @param {Object} options for graph node
   * @constructor
   */
  function BucketNode( CurveFittingModel, options ) {
    Node.call( this, options );

    // create bucket
    var bucketShape = new Shape();
    bucketShape.ellipticalArc( 0, 0, RADIUS_X, RADIUS_Y, 0, Math.PI, 0, false );
    bucketShape.ellipticalArc( 0, 30, RADIUS_X * 0.7, RADIUS_Y * 0.7, 0, 0, Math.PI, false );
    bucketShape.ellipticalArc( 0, 0, RADIUS_X, RADIUS_Y, 0, Math.PI, 2 * Math.PI, true );

    var bucketPath = new Path( bucketShape, {
      fill: new LinearGradient( 0, 0, RADIUS_X, 0 ).
        addColorStop( 0, 'rgb( 68, 66, 123 )' ).
        addColorStop( 1, 'rgb( 26, 25, 79 )' ),
      stroke: 'rgb( 24, 25, 74 )',
      lineWidth: 1
    } );
    this.addChild( bucketPath );

    // create hole
    var bucketHolePath = new Path( Shape.ellipse( 0, 0, RADIUS_X, RADIUS_Y ), {
      fill: new LinearGradient( 0, 0, RADIUS_X, 0 ).
        addColorStop( 0, 'rgb( 62, 62, 62 )' ).
        addColorStop( 1, 'rgb( 201, 201, 201 )' )
    } );
    this.addChild( bucketHolePath );

    // create clip shape for points
    var clipShape = new Shape();
    clipShape.ellipticalArc( 0, 0, RADIUS_X, RADIUS_Y, 0, Math.PI, 2 * Math.PI, true );
    clipShape.ellipticalArc( 0, 0, RADIUS_X, 4 * RADIUS_Y, 0, 0, Math.PI, true );

    // create points
    var pointsNode = new Node( { clipArea: clipShape } );
    var activePointView = new Circle( POINT_OPTIONS );
    activePointView.visible = false;
    POINTS_COORDS.forEach( function( pointsCoord ) {
      pointsNode.addChild( new Circle( _.extend( POINT_OPTIONS, {
        x: pointsCoord.x,
        y: pointsCoord.y
      } ) ) );
    } );
    this.addChild( pointsNode );

    // add drag handler
    this.addChild( activePointView );
    pointsNode.addInputListener( new SimpleDragHandler( {
      start: function( e ) {
        CurveFittingModel.createNewPoint( activePointView.globalToParentPoint( e.pointer.point ).copy() );
      },
      drag: function( e ) {
        if ( CurveFittingModel.activePoint ) {
          CurveFittingModel.activePoint.moveTo( activePointView.globalToParentPoint( e.pointer.point ) );
        }
      },
      end: function() {
        CurveFittingModel.dropActivePoint();
      }
    } ) );

    CurveFittingModel.activePointProperty.link( function( activePoint ) {
      if ( activePoint ) {
        activePointView.visible = true;

        activePoint.positionProperty.link( function( position ) {
          activePointView.setTranslation( position );
        } );
      }
      else {
        activePointView.visible = false;
        activePointView.setTranslation( 0, 0 );
      }
    } );
  }

  return inherit( Node, BucketNode );
} );