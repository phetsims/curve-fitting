// Copyright 2002-2014, University of Colorado Boulder

/**
 * Graph area node in 'Curve Fitting' simulation.
 * Contains points, curve and panel with equation parameters.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
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
   * @param {Property.<boolean>} isResidualsVisibleProperty - Property to track residuals visibility.
   * @param {Bounds2} plotBounds of graph area.
   * @param {Object} [options] for graph node.
   * @constructor
   */
  function GraphAreaNode( curve, orderOfFitProperty, isResidualsVisibleProperty, plotBounds, options ) {
    var self = this;
    var size = new Dimension2( (plotBounds.maxX - plotBounds.minX) * CurveFittingConstants.PIXELS_IN_TICK, (plotBounds.maxY - plotBounds.minY) * CurveFittingConstants.PIXELS_IN_TICK );

    Node.call( this, options );
    this._plotBounds = plotBounds;
    this._size = size;

    // add white background
    this.addChild( new Rectangle( 0, 0, size.width, size.height, { fill: 'white', lineWidth: 2, stroke: 'rgb( 214, 223, 226 )' } ) );

    var axisShape = new Shape();
    this.addChild( new Path( axisShape, AXIS_OPTIONS ) );

    // add X-axis and ticks
    axisShape.moveTo( 0, size.height / 2 );
    axisShape.lineTo( size.width, size.height / 2 );
    axisShape.moveTo( AXIS_OPTIONS.lineWidth / 2, size.height / 2 - TICK_LENGTH );
    axisShape.lineTo( AXIS_OPTIONS.lineWidth / 2, size.height / 2 + TICK_LENGTH );
    axisShape.moveTo( size.width / 4, size.height / 2 - TICK_LENGTH );
    axisShape.lineTo( size.width / 4, size.height / 2 + TICK_LENGTH );
    axisShape.moveTo( 3 * size.width / 4, size.height / 2 - TICK_LENGTH );
    axisShape.lineTo( 3 * size.width / 4, size.height / 2 + TICK_LENGTH );
    axisShape.moveTo( size.width - AXIS_OPTIONS.lineWidth / 2, size.height / 2 - TICK_LENGTH );
    axisShape.lineTo( size.width - AXIS_OPTIONS.lineWidth / 2, size.height / 2 + TICK_LENGTH );

    // add Y-axis and ticks
    axisShape.moveTo( size.width / 2, 0 );
    axisShape.lineTo( size.width / 2, size.height );
    axisShape.moveTo( size.width / 2 - TICK_LENGTH, AXIS_OPTIONS.lineWidth / 2 );
    axisShape.lineTo( size.width / 2 + TICK_LENGTH, AXIS_OPTIONS.lineWidth / 2 );
    axisShape.moveTo( size.width / 2 - TICK_LENGTH, size.height / 4 );
    axisShape.lineTo( size.width / 2 + TICK_LENGTH, size.height / 4 );
    axisShape.moveTo( size.width / 2 - TICK_LENGTH, 3 * size.height / 4 );
    axisShape.lineTo( size.width / 2 + TICK_LENGTH, 3 * size.height / 4 );
    axisShape.moveTo( size.width / 2 - TICK_LENGTH, size.height - AXIS_OPTIONS.lineWidth );
    axisShape.lineTo( size.width / 2 + TICK_LENGTH, size.height - AXIS_OPTIONS.lineWidth );

    // add clip area
    this.clipArea = Shape.rect( 0, 0, size.width, size.height );

    var curvePath = new Path( null, { stroke: 'black', lineWidth: 2 } );
    this.addChild( curvePath );

    var residualsPath = new Path( null, { stroke: CurveFittingConstants.GRAY_COLOR, lineWidth: 2 } );
    this.addChild( residualsPath );

    var updateShape = function() {
      var curveShape = null;
      var residualsShape = null;
      var orderOfFit = orderOfFitProperty.value;
      var xMin = self._plotBounds.minX;
      var xMax = self._plotBounds.maxX;
      var points = curve.getPoints();
      var a = curve.a;
      var b = curve.b;
      var c = curve.c;
      var d = curve.d;
      var x;

      if ( points.length > 1 && !isNaN( a ) && !isNaN( b ) && !isNaN( c ) && !isNaN( d ) ) {
        curveShape = new Shape();

        // update curve view
        if ( orderOfFit === 1 ) {
          curveShape.moveToPoint( self.getPositionFromGraphValues( xMin, xMin * c + d ) );
          curveShape.lineToPoint( self.getPositionFromGraphValues( xMax, xMax * c + d ) );
        }
        else if ( orderOfFit === 2 ) {
          for ( x = xMin; x < xMax; x += PLOT_STEP ) {
            curveShape.moveToPoint( self.getPositionFromGraphValues( x, a * Math.pow( x, 3 ) + b * Math.pow( x, 2 ) + c * x + d ) );
            curveShape.lineToPoint( self.getPositionFromGraphValues( x + PLOT_STEP, a * Math.pow( x + PLOT_STEP, 3 ) + b * Math.pow( x + PLOT_STEP, 2 ) + c * (x + PLOT_STEP) + d ) );
          }
        }
        else if ( orderOfFit === 3 ) {
          for ( x = xMin; x < xMax; x += PLOT_STEP ) {
            curveShape.moveToPoint( self.getPositionFromGraphValues( x, a * Math.pow( x, 3 ) + b * Math.pow( x, 2 ) + c * x + d ) );
            curveShape.lineToPoint( self.getPositionFromGraphValues( x + PLOT_STEP, a * Math.pow( x + PLOT_STEP, 3 ) + b * Math.pow( x + PLOT_STEP, 2 ) + c * (x + PLOT_STEP) + d ) );
          }
        }

        // update residuals
        if ( isResidualsVisibleProperty.value ) {
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
    curve.updateCurveTriggerProperty.lazyLink( updateShape );
    orderOfFitProperty.lazyLink( updateShape );
    isResidualsVisibleProperty.link( updateShape );
  }

  return inherit( Node, GraphAreaNode, {
    // check that point dropped into graph area
    checkDropPointAndSetValues: function( point ) {
      var isDropped = this.isContainsPoint( point );

      if ( isDropped ) {
        this.setValues( point );

        point.moveTo( this.localToGlobalPoint( this.getPositionFromGraphValues( point.x, point.y ) ) );
      }

      return isDropped;
    },

    // convert graph values to global coordinates
    getGraphValuesFromPosition: function( globalPosition ) {
      var locPosition = this.globalToParentPoint( globalPosition );

      return {
        x: Util.toFixedNumber( this._plotBounds.minX + this._plotBounds.width * (locPosition.x - this.bounds.minX) / this.width, 1 ),
        y: -Util.toFixedNumber( this._plotBounds.minY + this._plotBounds.height * (locPosition.y - this.bounds.minY) / this.height, 1 )
      };
    },

    // convert global coordinates to graph values
    getPositionFromGraphValues: function( x, y ) {
      return new Vector2(
        (( x - this._plotBounds.minX ) / (this._plotBounds.width)) * this._size.width,
        (( -y - this._plotBounds.minY ) / (this._plotBounds.height)) * this._size.height
      );
    },

    // whether the point is inside the GraphAreaNode (or on the boundary)
    isContainsPoint: function( point ) {
      return this.localBounds.containsPoint( this.globalToLocalPoint( point.position ) );
    },

    // set value of point
    setValues: function( point ) {
      var values;
      if ( this.isContainsPoint( point ) ) {
        values = this.getGraphValuesFromPosition( point.position );
        point.x = values.x;
        point.y = values.y;
      }
      else {
        point.x = NaN;
        point.y = NaN;
      }
    }
  } );
} );