// Copyright 2015, University of Colorado Boulder

/**
 * Bucket node and graph area node in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var BucketNode = require( 'CURVE_FITTING/curve-fitting/view/BucketNode' );
  var EquationGraphPanelNode = require( 'CURVE_FITTING/curve-fitting/view/EquationGraphPanelNode' );
  var GraphAreaNode = require( 'CURVE_FITTING/curve-fitting/view/GraphAreaNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Point = require( 'CURVE_FITTING/curve-fitting/model/Point' );
  var PointNode = require( 'CURVE_FITTING/curve-fitting/view/PointNode' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  /**
   * @param {CurveFittingModel} curveFittingModel
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options] for graph node
   * @constructor
   */
  function BucketAndGraphAreaNode( curveFittingModel, modelViewTransform, options ) {
    // create bucket node
    var bucketNode = new BucketNode( curveFittingModel.bucket, modelViewTransform );

    // create graph area node
    var graphAreaNode = new GraphAreaNode( curveFittingModel.curve, curveFittingModel.orderOfFitProperty, curveFittingModel.areResidualsVisibleProperty, curveFittingModel.graphModelBounds, modelViewTransform );

    // add equation node
    var equationGraphPanelNode = new EquationGraphPanelNode( curveFittingModel.isEquationPanelExpandedProperty, curveFittingModel.curve, curveFittingModel.orderOfFitProperty );

    Node.call( this, _.extend( {
      children: [
        graphAreaNode, bucketNode, equationGraphPanelNode
      ]
    }, options ) );
    equationGraphPanelNode.centerX = graphAreaNode.bounds.minX + equationGraphPanelNode.width / 2 + 10;
    equationGraphPanelNode.centerY = graphAreaNode.bounds.minY + equationGraphPanelNode.height / 2 + 10;

    // add drag handler
    var pointsNode = new Node();
    this.addChild( pointsNode );

    var pointModel = null;
    var pointView = null;
    bucketNode.addInputListener( new SimpleDragHandler( {
      start: function( e ) {
        // create point model
        pointModel = new Point();
        curveFittingModel.curve.points.add( pointModel );

        // create point view
        pointView = new PointNode( pointModel, curveFittingModel.curve.points, curveFittingModel.areValuesVisibleProperty, curveFittingModel.areResidualsVisibleProperty, pointsNode, graphAreaNode );

        // add point node to view
        pointsNode.addChild( pointView );

        // add listeners for the points created
        curveFittingModel.curve.points.addItemAddedListener( function( point ) {

          // removes points from view and point listeners are removed
          curveFittingModel.curve.points.addItemRemovedListener( function removalListener( removedPoint ) {
            if ( removedPoint === point ) {
              pointsNode.removeChild( pointView );
              curveFittingModel.curve.points.removeItemRemovedListener( removalListener );
            }
          } );
        } );

        // update point position
        pointView.setTranslation( pointsNode.globalToLocalPoint( e.pointer.point ) );
        pointModel.trigger( 'updatePosition' );
      },
      drag: function( e ) {
        if ( pointModel ) {
          // update point position
          pointView.setTranslation( pointsNode.globalToLocalPoint( e.pointer.point ) );
          pointModel.trigger( 'updatePosition' );
        }
      },
      end: function() {
        if ( !pointModel.isInsideGraph ) {
          // remove point model and view
          pointsNode.removeChild( pointView );
          curveFittingModel.curve.points.remove( pointModel );
        }
        else {
          // round point position
          pointModel.trigger( 'roundPosition' );
        }

        pointModel = null;
      }
    } ) );
  }

  curveFitting.register( 'BucketAndGraphAreaNode', BucketAndGraphAreaNode );

  return inherit( Node, BucketAndGraphAreaNode );
} );