// Copyright 2002-2014, University of Colorado Boulder

/**
 * Bucket node and graph area node in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var BucketNode = require( 'CURVE_FITTING/curve-fitting/view/BucketNode' );
  var EquationGraphPanelNode = require( 'CURVE_FITTING/curve-fitting/view/EquationGraphPanelNode' );
  var GraphAreaNode = require( 'CURVE_FITTING/curve-fitting/view/GraphAreaNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PointNode = require( 'CURVE_FITTING/curve-fitting/view/PointNode' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  /**
   * @param {CurveFittingModel} CurveFittingModel
   * @param {Object} [options] for graph node
   * @constructor
   */
  function BucketAndGraphAreaNode( CurveFittingModel, options ) {
    var self = this;

    // create bucket node
    var bucketNode = new BucketNode();

    // create graph area node
    var graphAreaNode = new GraphAreaNode( CurveFittingModel.curve, CurveFittingModel.orderOfFitProperty, CurveFittingModel.isResidualsVisibleProperty, CurveFittingModel.graphArea );

    // add equation node
    var equationGraphPanelNode = new EquationGraphPanelNode( CurveFittingModel.isEquationPanelExpandedProperty, CurveFittingModel.curve, CurveFittingModel.orderOfFitProperty, { centerY: 20 } );

    HBox.call( this, _.extend( {
      spacing: 30,
      children: [ bucketNode, graphAreaNode ],
      resize: false,
      align: 'bottom'
    }, options ) );
    this.addChild( equationGraphPanelNode );
    equationGraphPanelNode.centerX = graphAreaNode.bounds.minX + equationGraphPanelNode.width / 2 + 10;

    // add drag handler
    var point = null;
    bucketNode.addInputListener( new SimpleDragHandler( {
      start: function( e ) {
        point = CurveFittingModel.getPoint( e.pointer.point );
        graphAreaNode.setValues( point );
        CurveFittingModel.curve.points.add( point );
      },
      drag: function( e ) {
        if ( point ) {
          point.moveTo( e.pointer.point );
          graphAreaNode.setValues( point );
        }
      },
      end: function() {
        if ( !graphAreaNode.checkDropPointAndSetValues( point ) ) {
          CurveFittingModel.curve.points.remove( point );
        }

        point = null;
      }
    } ) );

    var pointStorage = [];
    var pointsNode = new Node();
    this.addChild( pointsNode );
    CurveFittingModel.curve.points.addItemAddedListener( function( pointModel ) {
      var pointView = new PointNode( pointModel, CurveFittingModel.curve.points, CurveFittingModel.isValuesVisibleProperty, CurveFittingModel.isResidualsVisibleProperty, self, graphAreaNode );
      pointStorage.push( { model: pointModel, view: pointView } );
      pointsNode.addChild( pointView );
    } );

    CurveFittingModel.curve.points.addItemRemovedListener( function( pointModel ) {
      pointsNode.removeChild( _.find( pointStorage, { model: pointModel } ).view );
    } );
  }

  return inherit( HBox, BucketAndGraphAreaNode );
} );