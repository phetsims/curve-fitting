// Copyright 2002-2014, University of Colorado Boulder

/**
 * Node with fit types and adjusting sliders in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
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
  var LINE_OPTIONS = {
    lineWidth: 1,
    stroke: 'black'
  };
  var PIXELS_IN_TICK = 10;
  var TICK_LENGTH = 7;

  /**
   * @param {Curve}
   * @param {Bounds2} plotBounds of graph area.
   * @param {Object} options for graph node.
   * @constructor
   */
  function GraphAreaNode( curve, orderOfFitProperty, plotBounds, options ) {
    var self = this;
    var size = new Dimension2( (plotBounds.maxX - plotBounds.minX) * PIXELS_IN_TICK, (plotBounds.maxY - plotBounds.minY) * PIXELS_IN_TICK );

    Node.call( this, options );
    this._plotBounds = plotBounds;
    this._size = size;

    // add white background
    this.addChild( new Rectangle( 0, 0, size.width, size.height, { fill: 'white' } ) );

    // add X-axis and ticks
    this.addChild( new Line( 0, size.height / 2, size.width, size.height / 2, LINE_OPTIONS ) );
    this.addChild( new Line( LINE_OPTIONS.lineWidth / 2, size.height / 2 - TICK_LENGTH, LINE_OPTIONS.lineWidth / 2, size.height / 2 + TICK_LENGTH, LINE_OPTIONS ) );
    this.addChild( new Line( size.width / 4, size.height / 2 - TICK_LENGTH, size.width / 4, size.height / 2 + TICK_LENGTH, LINE_OPTIONS ) );
    this.addChild( new Line( 3 * size.width / 4, size.height / 2 - TICK_LENGTH, 3 * size.width / 4, size.height / 2 + TICK_LENGTH, LINE_OPTIONS ) );
    this.addChild( new Line( size.width - LINE_OPTIONS.lineWidth, size.height / 2 - TICK_LENGTH, size.width - LINE_OPTIONS.lineWidth, size.height / 2 + TICK_LENGTH, LINE_OPTIONS ) );

    // add Y-axis
    this.addChild( new Line( size.width / 2, 0, size.width / 2, size.height, LINE_OPTIONS ) );
    this.addChild( new Line( size.width / 2 - TICK_LENGTH, LINE_OPTIONS.lineWidth / 2, size.width / 2 + TICK_LENGTH, LINE_OPTIONS.lineWidth / 2, LINE_OPTIONS ) );
    this.addChild( new Line( size.width / 2 - TICK_LENGTH, size.height / 4, size.width / 2 + TICK_LENGTH, size.height / 4, LINE_OPTIONS ) );
    this.addChild( new Line( size.width / 2 - TICK_LENGTH, 3 * size.height / 4, size.width / 2 + TICK_LENGTH, 3 * size.height / 4, LINE_OPTIONS ) );
    this.addChild( new Line( size.width / 2 - TICK_LENGTH, size.height - LINE_OPTIONS.lineWidth, size.width / 2 + TICK_LENGTH, size.height - LINE_OPTIONS.lineWidth, LINE_OPTIONS ) );

    // add clip area
    this.clipArea = Shape.rect( 0, 0, size.width, size.height );

    var pathCurve = new Path( null, { stroke: 'black', lineWidth: 2 } );
    this.addChild( pathCurve );

    var updateShape = function() {
      var curveShape = new Shape();
      var orderOfFit = orderOfFitProperty.value;
      var xMin = self._plotBounds.minX;
      var xMax = self._plotBounds.maxX;

      var d = curve.d;
      var c = curve.c;
      var b = curve.b;
      if ( orderOfFit === 1 ) {
        curveShape.moveToPoint( self.getPositionFromGraphValues( xMin, xMin * c + d ) );
        curveShape.lineToPoint( self.getPositionFromGraphValues( xMax, xMax * c + d ) );
      }
      else if ( orderOfFit === 2 ) {
        /*curveShape.moveToPoint( self.getPositionFromGraphValues( xMin, b * xMin * xMin + xMin * c + d ) );
         var controlPoint = self.getPositionFromGraphValues( -c / d, b * (-c / d) * (-c / d) + (-c / d) * c + d );
         var endPoint = self.getPositionFromGraphValues( xMax, b * xMax * xMax + xMax * c + d );
         curveShape.quadraticCurveToPoint( controlPoint, endPoint );*/
      }

      pathCurve.setShape( curveShape );
    };

    var clearShape = function() {
      pathCurve.setShape( null );
    };

    curve.updateCurveTriggerProperty.link( function() {
      if ( curve.points.getArray().length > 1 ) {
        updateShape();
      }
      else {
        clearShape();
      }
    } );

    curve.isVisibleProperty.linkAttribute( pathCurve, 'visible' );
  }

  return inherit( Node, GraphAreaNode, {
    // check that point dropped into graph area
    checkDropPointAndSetValues: function( point ) {
      var isDropped = this.bounds.containsPoint( this.globalToParentPoint( point.position ) );

      if ( isDropped ) {
        this.setValues( point );

        point.moveTo( this.localToGlobalPoint( this.getPositionFromGraphValues( point.x, point.y ) ) );
      }

      return isDropped;
    },

    setValues: function( point ) {
      var values = this.getGraphValuesFromPosition( point.position );
      point.x = values.x;
      point.y = values.y;
    },

    // convert graph values to global coordinates
    getGraphValuesFromPosition: function( globalPosition ) {
      var locPosition = this.globalToParentPoint( globalPosition );

      return {
        x: Util.toFixedNumber( this._plotBounds.minX + this._plotBounds.width * (locPosition.x - this.bounds.minX) / this.width, 1 ),
        y: Util.toFixedNumber( this._plotBounds.minY + this._plotBounds.height * (locPosition.y - this.bounds.minY) / this.height, 1 )
      };
    },

    // convert global coordinates to graph values
    getPositionFromGraphValues: function( x, y ) {
      return new Vector2(
        (( x - this._plotBounds.minX ) / (this._plotBounds.width)) * this._size.width,
        (( y - this._plotBounds.minY ) / (this._plotBounds.height)) * this._size.height
      );
    }
  } );
} );