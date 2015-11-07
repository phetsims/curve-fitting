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
   * @param {Object} graphAreaModel - Model of graph area.
   * @param {Object} [options] for graph node.
   * @constructor
   */
  function GraphAreaNode( curve, orderOfFitProperty, areResidualsVisibleProperty, graphAreaModel, options ) {
    var self = this;
    var graphAreaSize = graphAreaModel.size;
    var graphAreaBounds = graphAreaModel.bounds;

    Node.call( this, options );
    this.translate( graphAreaBounds.minX, graphAreaBounds.minY );
    this._graphAreaSize = graphAreaSize;
    this._graphAreaBounds = graphAreaBounds;
    this._graphScale = graphAreaBounds.width / graphAreaSize.width;

    // add white background
    this.addChild( new Rectangle( 0, 0, graphAreaBounds.width, graphAreaBounds.height, {
      fill: 'white',
      lineWidth: 2,
      stroke: 'rgb( 214, 223, 226 )'
    } ) );

    var axisShape = new Shape();
    this.addChild( new Path( axisShape, AXIS_OPTIONS ) );

    // add X-axis and ticks
    axisShape.moveTo( 0, graphAreaBounds.height / 2 );
    axisShape.lineTo( graphAreaBounds.width, graphAreaBounds.height / 2 );
    axisShape.moveTo( AXIS_OPTIONS.lineWidth / 2, graphAreaBounds.height / 2 - TICK_LENGTH );
    axisShape.lineTo( AXIS_OPTIONS.lineWidth / 2, graphAreaBounds.height / 2 + TICK_LENGTH );
    axisShape.moveTo( graphAreaBounds.width / 4, graphAreaBounds.height / 2 - TICK_LENGTH );
    axisShape.lineTo( graphAreaBounds.width / 4, graphAreaBounds.height / 2 + TICK_LENGTH );
    axisShape.moveTo( 3 * graphAreaBounds.width / 4, graphAreaBounds.height / 2 - TICK_LENGTH );
    axisShape.lineTo( 3 * graphAreaBounds.width / 4, graphAreaBounds.height / 2 + TICK_LENGTH );
    axisShape.moveTo( graphAreaBounds.width - AXIS_OPTIONS.lineWidth / 2, graphAreaBounds.height / 2 - TICK_LENGTH );
    axisShape.lineTo( graphAreaBounds.width - AXIS_OPTIONS.lineWidth / 2, graphAreaBounds.height / 2 + TICK_LENGTH );

    // add Y-axis and ticks
    axisShape.moveTo( graphAreaBounds.width / 2, 0 );
    axisShape.lineTo( graphAreaBounds.width / 2, graphAreaBounds.height );
    axisShape.moveTo( graphAreaBounds.width / 2 - TICK_LENGTH, AXIS_OPTIONS.lineWidth / 2 );
    axisShape.lineTo( graphAreaBounds.width / 2 + TICK_LENGTH, AXIS_OPTIONS.lineWidth / 2 );
    axisShape.moveTo( graphAreaBounds.width / 2 - TICK_LENGTH, graphAreaBounds.height / 4 );
    axisShape.lineTo( graphAreaBounds.width / 2 + TICK_LENGTH, graphAreaBounds.height / 4 );
    axisShape.moveTo( graphAreaBounds.width / 2 - TICK_LENGTH, 3 * graphAreaBounds.height / 4 );
    axisShape.lineTo( graphAreaBounds.width / 2 + TICK_LENGTH, 3 * graphAreaBounds.height / 4 );
    axisShape.moveTo( graphAreaBounds.width / 2 - TICK_LENGTH, graphAreaBounds.height - AXIS_OPTIONS.lineWidth );
    axisShape.lineTo( graphAreaBounds.width / 2 + TICK_LENGTH, graphAreaBounds.height - AXIS_OPTIONS.lineWidth );

    // add clip area
    this.clipArea = Shape.rect( 0, 0, graphAreaBounds.width, graphAreaBounds.height );

    var curvePath = new Path( null, { stroke: 'black', lineWidth: 2 } );
    this.addChild( curvePath );

    var residualsPath = new Path( null, { stroke: CurveFittingConstants.GRAY_COLOR, lineWidth: 2 } );
    this.addChild( residualsPath );

    var updateShape = function() {
      var curveShape = null;
      var residualsShape = null;
      var orderOfFit = orderOfFitProperty.value;
      var xMin = graphAreaSize.minX;
      var xMax = graphAreaSize.maxX;
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
        x: Util.toFixedNumber( this._graphAreaSize.minX + this._graphAreaSize.width * ( locPosition.x - this.bounds.minX ) / this.width, 1 ),
        y: -Util.toFixedNumber( this._graphAreaSize.minY + this._graphAreaSize.height * ( locPosition.y - this.bounds.minY ) / this.height, 1 )
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
        (( x - this._graphAreaSize.minX ) / ( this._graphAreaSize.width )) * this._graphAreaBounds.width,
        (( -y - this._graphAreaSize.minY ) / ( this._graphAreaSize.height )) * this._graphAreaBounds.height
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