// Copyright 2015-2016, University of Colorado Boulder

//TODO these 2 UI components should not be combined here
/**
 * Bucket node and graph area node in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var BucketNode = require( 'CURVE_FITTING/curve-fitting/view/BucketNode' );
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var EquationGraphPanelNode = require( 'CURVE_FITTING/curve-fitting/view/EquationGraphPanelNode' );
  var GraphAreaNode = require( 'CURVE_FITTING/curve-fitting/view/GraphAreaNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Point = require( 'CURVE_FITTING/curve-fitting/model/Point' );
  var PointNode = require( 'CURVE_FITTING/curve-fitting/view/PointNode' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  /**
   * @param {Curve} curve
   * @param {Bucket} bucket
   * @param {Property.<number>} orderProperty
   * @param {Bounds2} graphBounds - bounds of the graph, in model coordinate frame
   * @param {Property.<boolean>} residualsVisibleProperty
   * @param {Property.<boolean>} valuesVisibleProperty
   * @param {Property.<boolean>} equationPanelExpandedProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options] for graph node TODO should be options for this type!
   * @constructor
   */
  function BucketAndGraphAreaNode( curve, bucket, orderProperty, graphBounds, residualsVisibleProperty, valuesVisibleProperty, equationPanelExpandedProperty, modelViewTransform, options ) {

    Node.call( this, options );

    var self = this;

    // create the bucket node
    var bucketNode = new BucketNode( bucket, modelViewTransform );

    // create the graph area node - responsible for the rendering of the curves, as well as the axes and background.
    var graphAreaNode = new GraphAreaNode( curve, orderProperty, residualsVisibleProperty, graphBounds, modelViewTransform );

    // create the equation node (accordion box) in the upper left corner of the graph
    var equationGraphPanelNode = new EquationGraphPanelNode( equationPanelExpandedProperty, curve, orderProperty );

    // create a separate layers for all the points
    var pointsNode = new Node();
    // @private
    this.pointsNode = pointsNode;

    // add the children to the screen graph
    this.addChild( graphAreaNode );
    this.addChild( bucketNode );
    this.addChild( equationGraphPanelNode );
    this.addChild( pointsNode );

    // handle the coming and going of points
    curve.points.addItemAddedListener( function( addedPoint ) {
      var pointNode = new PointNode( addedPoint, valuesVisibleProperty, residualsVisibleProperty, modelViewTransform );
      self.addChild( pointNode );

      curve.points.addItemRemovedListener( function removalListener( removedPoint ) {
        if ( removedPoint === addedPoint ) {
          self.removeChild( pointNode );
          pointNode.dispose();
          curve.points.removeItemRemovedListener( removalListener );
        }
      } );
    } );

    // layout
    equationGraphPanelNode.left = graphAreaNode.left + 10;
    equationGraphPanelNode.top = graphAreaNode.top + 10;

    // add drag handler to the bucketNode
    var point = null;
    bucketNode.addInputListener( new SimpleDragHandler( {

      allowTouchSnag: true,

      start: function( event ) {

        // create a point
        var viewPosition = pointsNode.globalToLocalPoint( event.pointer.point );
        var modelPosition = modelViewTransform.viewToModelPosition( viewPosition );
        point = new Point( {
          position: modelPosition,
          isUserControlled: true
        } );

        // add the point to the curve
        curve.points.add( point );
      },

      translate: function( translationParams ) {
        //TODO replace this type of assignment with point.positionProperty.set
        point.position = point.position.plus( modelViewTransform.viewToModelDelta( translationParams.delta ) );
      },

      end: function() {
        //TODO replace this type of assignment with point.isUserControlledProperty.set
        point.isUserControlled = false;
        point = null;
      }
    } ) );
  }

  curveFitting.register( 'BucketAndGraphAreaNode', BucketAndGraphAreaNode );

  return inherit( Node, BucketAndGraphAreaNode );
} );