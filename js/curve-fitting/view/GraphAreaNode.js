// Copyright 2015, University of Colorado Boulder

/**
 * Graph area node in 'Curve Fitting' simulation.
 * Contains graph area, curve and panel with equation parameters.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var FitType = require( 'CURVE_FITTING/curve-fitting/model/FitType' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var AXIS_OPTIONS = {
    lineWidth: 1,
    stroke: 'black'
  };
  var PLOT_STEP = 0.1;
  var TICK_LENGTH = 7;

  /**
   * @param {Curve} curve model.
   * @param {Property.<number>} orderOfFitProperty - Property with current order of fit.
   * @param {Property.<boolean>} areResidualsVisibleProperty - Property to track residuals visibility.
   * @param {Bounds2} graphModelBounds -  bounds of the graph
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options] for graph node.
   * @constructor
   */
  function GraphAreaNode( curve, orderOfFitProperty, areResidualsVisibleProperty, graphModelBounds, modelViewTransform, options ) {
    var self = this;

    var graphViewBounds = modelViewTransform.modelToViewBounds( graphModelBounds );

    Node.call( this, options );
    this.translate( graphViewBounds.minX, graphViewBounds.minY );
    this._graphModelBounds = graphModelBounds;
    this._graphViewBounds = graphViewBounds;
    this._graphScale = modelViewTransform.modelToViewDeltaX( 1 );

    // add white background
    this.addChild( new Rectangle( 0, 0, graphViewBounds.width, graphViewBounds.height, {
      fill: 'white',
      lineWidth: 2,
      stroke: 'rgb( 214, 223, 226 )'
    } ) );

    var axisShape = new Shape();
    this.addChild( new Path( axisShape, AXIS_OPTIONS ) );

    // add X-axis and ticks
    axisShape.moveTo( 0, graphViewBounds.height / 2 );
    axisShape.lineTo( graphViewBounds.width, graphViewBounds.height / 2 );
    axisShape.moveTo( AXIS_OPTIONS.lineWidth / 2, graphViewBounds.height / 2 - TICK_LENGTH );
    axisShape.lineTo( AXIS_OPTIONS.lineWidth / 2, graphViewBounds.height / 2 + TICK_LENGTH );
    axisShape.moveTo( graphViewBounds.width / 4, graphViewBounds.height / 2 - TICK_LENGTH );
    axisShape.lineTo( graphViewBounds.width / 4, graphViewBounds.height / 2 + TICK_LENGTH );
    axisShape.moveTo( 3 * graphViewBounds.width / 4, graphViewBounds.height / 2 - TICK_LENGTH );
    axisShape.lineTo( 3 * graphViewBounds.width / 4, graphViewBounds.height / 2 + TICK_LENGTH );
    axisShape.moveTo( graphViewBounds.width - AXIS_OPTIONS.lineWidth / 2, graphViewBounds.height / 2 - TICK_LENGTH );
    axisShape.lineTo( graphViewBounds.width - AXIS_OPTIONS.lineWidth / 2, graphViewBounds.height / 2 + TICK_LENGTH );

    // add Y-axis and ticks
    axisShape.moveTo( graphViewBounds.width / 2, 0 );
    axisShape.lineTo( graphViewBounds.width / 2, graphViewBounds.height );
    axisShape.moveTo( graphViewBounds.width / 2 - TICK_LENGTH, AXIS_OPTIONS.lineWidth / 2 );
    axisShape.lineTo( graphViewBounds.width / 2 + TICK_LENGTH, AXIS_OPTIONS.lineWidth / 2 );
    axisShape.moveTo( graphViewBounds.width / 2 - TICK_LENGTH, graphViewBounds.height / 4 );
    axisShape.lineTo( graphViewBounds.width / 2 + TICK_LENGTH, graphViewBounds.height / 4 );
    axisShape.moveTo( graphViewBounds.width / 2 - TICK_LENGTH, 3 * graphViewBounds.height / 4 );
    axisShape.lineTo( graphViewBounds.width / 2 + TICK_LENGTH, 3 * graphViewBounds.height / 4 );
    axisShape.moveTo( graphViewBounds.width / 2 - TICK_LENGTH, graphViewBounds.height - AXIS_OPTIONS.lineWidth );
    axisShape.lineTo( graphViewBounds.width / 2 + TICK_LENGTH, graphViewBounds.height - AXIS_OPTIONS.lineWidth );

    // add clip area
    this.clipArea = Shape.rect( 0, 0, graphViewBounds.width, graphViewBounds.height );

    var curvePath = new Path( null, { stroke: 'black', lineWidth: 2 } );
    this.addChild( curvePath );

    var residualsPath = new Path( null, { stroke: CurveFittingConstants.GRAY_COLOR, lineWidth: 2 } );
    this.addChild( residualsPath );

    var updateShape = function() {
      var curveShape = null;
      var residualsShape = null;
      var orderOfFit = orderOfFitProperty.value;
      var xMin = graphModelBounds.minX;
      var xMax = graphModelBounds.maxX;
      var points = curve.getPoints();
      var a = curve.a;
      var b = curve.b;
      var c = curve.c;
      var d = curve.d;
      var x;

      if ( ( points.length > 1 || curve._fitTypeProperty.value === FitType.ADJUSTABLE ) && !isNaN( a ) && !isNaN( b ) && !isNaN( c ) && !isNaN( d ) ) {
        curveShape = new Shape();

        // update curve view
        if ( orderOfFit === 1 ) {
          curveShape.moveToPoint( self.getPositionFromGraphValues( xMin, xMin * c + d ) );
          curveShape.lineToPoint( self.getPositionFromGraphValues( xMax, xMax * c + d ) );
        }
        else if ( orderOfFit === 2 ) {
          for ( x = xMin; x < xMax; x += PLOT_STEP ) {
            curveShape.moveToPoint( self.getPositionFromGraphValues( x, a * Math.pow( x, 3 ) + b * Math.pow( x, 2 ) + c * x + d ) );
            curveShape.lineToPoint( self.getPositionFromGraphValues( x + PLOT_STEP, a * Math.pow( x + PLOT_STEP, 3 ) + b * Math.pow( x + PLOT_STEP, 2 ) + c * ( x + PLOT_STEP ) + d ) );
          }
        }
        else if ( orderOfFit === 3 ) {
          for ( x = xMin; x < xMax; x += PLOT_STEP ) {
            curveShape.moveToPoint( self.getPositionFromGraphValues( x, a * Math.pow( x, 3 ) + b * Math.pow( x, 2 ) + c * x + d ) );
            curveShape.lineToPoint( self.getPositionFromGraphValues( x + PLOT_STEP, a * Math.pow( x + PLOT_STEP, 3 ) + b * Math.pow( x + PLOT_STEP, 2 ) + c * ( x + PLOT_STEP ) + d ) );
          }
        }

        // update residuals
        if ( areResidualsVisibleProperty.value ) {
          residualsShape = new Shape();

          points.forEach( function( point ) {
            if ( orderOfFit === 1 ) {
              residualsShape.moveToPoint( self.getPositionFromGraphValues( point.x, point.y ) );
              residualsShape.lineToPoint( self.getPositionFromGraphValues( point.x, c * point.x + d ) );
            }
            else if ( orderOfFit === 2 ) {
              residualsShape.moveToPoint( self.getPositionFromGraphValues( point.x, point.y ) );
              residualsShape.lineToPoint( self.getPositionFromGraphValues( point.x, b * Math.pow( point.x, 2 ) + c * point.x + d ) );
            }
            else if ( orderOfFit === 3 ) {
              residualsShape.moveToPoint( self.getPositionFromGraphValues( point.x, point.y ) );
              residualsShape.lineToPoint( self.getPositionFromGraphValues( point.x, a * Math.pow( point.x, 3 ) + b * Math.pow( point.x, 2 ) + c * point.x + d ) );
            }
          } );
        }
      }

      curvePath.setShape( curveShape );
      residualsPath.setShape( residualsShape );
    };

    curve.isVisibleProperty.linkAttribute( curvePath, 'visible' );
    orderOfFitProperty.lazyLink( updateShape );
    areResidualsVisibleProperty.link( updateShape );
    curve.on( 'update', updateShape );
  }

  curveFitting.register( 'GraphAreaNode', GraphAreaNode );

  return inherit( Node, GraphAreaNode, {
    /**
     * Convert global coordinates to graph values.
     *
     * @param {Vector2} globalPosition - Global point position.
     * @returns {Object}
     */
    getGraphValuesFromPosition: function( globalPosition ) {
      var locPosition = this.globalToParentPoint( globalPosition );

      return {
        x: Util.toFixedNumber( this._graphModelBounds.minX + this._graphModelBounds.width * ( locPosition.x - this.bounds.minX ) / this.width, 1 ),
        y: -Util.toFixedNumber( this._graphModelBounds.minY + this._graphModelBounds.height * ( locPosition.y - this.bounds.minY ) / this.height, 1 )
      };
    },

    /**
     * Convert graph values to global coordinates.
     *
     * @param {number} x graph value.
     * @param {number} y graph value.
     * @returns {Vector2}
     */
    // convert global coordinates to graph values
    getPositionFromGraphValues: function( x, y ) {
      return new Vector2(
        (( x - this._graphModelBounds.minX ) / ( this._graphModelBounds.width )) * this._graphViewBounds.width,
        (( -y - this._graphModelBounds.minY ) / ( this._graphModelBounds.height )) * this._graphViewBounds.height
      );
    },

    /**
     * Check is point inside the GraphAreaNode (or on the boundary).
     *
     * @param {Vector2} pointPosition - Position of point that need to check.
     * @returns {boolean}
     */
    isPointInsideGraph: function( pointPosition ) {
      return this.localBounds.containsPoint( this.globalToLocalPoint( pointPosition ) );
    }
  } );
} );