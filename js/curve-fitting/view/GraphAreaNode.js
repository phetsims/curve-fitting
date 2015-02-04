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
  var PointNode = require( 'CURVE_FITTING/curve-fitting/view/PointNode' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Util = require( 'DOT/Util' );

  // constants
  var LINE_OPTIONS = {
    lineWidth: 1,
    stroke: 'black'
  };
  var PIXELS_IN_TICK = 10;
  var TICK_LENGTH = 7;
  var POINT_OPTIONS = {
    fill: 'rgb( 252, 151, 64 )',
    radius: 6,
    stroke: 'black',
    lineWidth: 1
  };

  /**
   * @param {PropertySet} curve model.
   * @param {Property<Point>} activePointProperty - Link to active point.
   * @param {Property<boolean>} isActivePointVisibleProperty - Property to control visibility of active point.
   * @param {Bounds2} plotBounds of graph area.
   * @param {Object} options for graph node.
   * @constructor
   */
  function GraphAreaNode( curve, activePointProperty, isActivePointVisibleProperty, plotBounds, options ) {
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

    curve.points.addItemAddedListener( function( point ) {
      self.addPoint( point );
    } );
  }

  return inherit( Node, GraphAreaNode, {
    // add point to graph area
    addPoint: function( point ) {
      var position = this.getPositionFromGraphValues( point.x, point.y );

      // add point view
      var pointNodeView = new PointNode( point, POINT_OPTIONS );
      pointNodeView.centerX = position.x;
      pointNodeView.centerY = position.y;
      this.addChild( pointNodeView );

      var controlledPoint = null;
      pointNodeView.addInputListener( new SimpleDragHandler( {
        start: function() {
          controlledPoint = point;
          //self.removeChild( pointNodeView );
        },
        drag: function( e ) {
          if ( controlledPoint ) {
            controlledPoint.moveTo( e.pointer.point );
          }
        },
        end: function() {
          controlledPoint = null;
        }
      } ) );

      point.positionProperty.lazyLink( function( position ) {
        pointNodeView.setTranslation( pointNodeView.globalToParentPoint( position ) );
      } );
    },

    // check that point dropped into graph area
    checkDropPoint: function( pointPosition ) {
      return this.bounds.containsPoint( this.globalToParentPoint( pointPosition ) );
    },

    getGraphValuesFromPosition: function( globalPosition ) {
      var locPosition = this.globalToParentPoint( globalPosition );

      return {
        x: Util.toFixedNumber( this._plotBounds.minX + this._plotBounds.width * (locPosition.x - this.bounds.minX) / this.width, 1 ),
        y: Util.toFixedNumber( this._plotBounds.minY + this._plotBounds.height * (locPosition.y - this.bounds.minY) / this.height, 1 )
      };
    },

    getPositionFromGraphValues: function( x, y ) {
      return {
        x: (( x - this._plotBounds.minX ) / (this._plotBounds.width)) * this._size.width,
        y: (( y - this._plotBounds.minY ) / (this._plotBounds.height)) * this._size.height
      };
    }
  } );
} );