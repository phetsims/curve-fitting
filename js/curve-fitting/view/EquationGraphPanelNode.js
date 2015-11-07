// Copyright 2015, University of Colorado Boulder

/**
 * Node with equation parameters in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var ExpandCollapseButton = require( 'SUN/ExpandCollapseButton' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Panel = require( 'SUN/Panel' );
  var Text = require( 'SCENERY/nodes/Text' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var Util = require( 'DOT/Util' );

  // strings
  var equationString = require( 'string!CURVE_FITTING/equation' );

  // constants
  var BUTTON_LENGTH = 16;
  var PANEL_OPTIONS = {
    cornerRadius: CurveFittingConstants.PANEL_CORNER_RADIUS,
    fill: 'white'
  };
  var PARAMETER_TEXT_OPTIONS = {
    font: new PhetFont( {
      weight: 'bold',
      size: 12
    } ),
    fill: CurveFittingConstants.BLUE_COLOR
  };
  var TEXT_OPTIONS = { font: new PhetFont( 12 ) };

  /**
   * @param {Property.<boolean>} isEquationPanelExpandedProperty - Property to control equation panel expansion.
   * @param {Curve} curve model.
   * @param {Property.<number>} orderFitProperty parameter to track.
   * @param {Object} [options] for slider node.
   * @constructor
   */
  function EquationGraphPanelNode( isEquationPanelExpandedProperty, curve, orderFitProperty, options ) {
    var boxNode = new HBox( { align: 'bottom' } );
    var titleNode = new Text( equationString, TEXT_OPTIONS );

    // create expand button
    var expandCollapseButton = new ExpandCollapseButton( isEquationPanelExpandedProperty, {
      sideLength: BUTTON_LENGTH
    } );
    expandCollapseButton.touchArea = expandCollapseButton.localBounds.dilatedXY( BUTTON_LENGTH, BUTTON_LENGTH );
    expandCollapseButton.mouseArea = expandCollapseButton.localBounds.dilatedXY( BUTTON_LENGTH, BUTTON_LENGTH );

    // create parameters node
    var yNode = new Text( 'y = ', TEXT_OPTIONS );
    var aParameterNode = new Text( 'a', PARAMETER_TEXT_OPTIONS );
    var aBlockNode = new HBox( {
      align: 'bottom',
      children: [
        aParameterNode,
        new SubSupText( 'x<sup>3</sup>', TEXT_OPTIONS ),
        new Text( ' + ', TEXT_OPTIONS )
      ]
    } );
    var bParameterNode = new Text( 'b', PARAMETER_TEXT_OPTIONS );
    var bBlockNode = new HBox( {
      align: 'bottom',
      children: [
        bParameterNode,
        new SubSupText( 'x<sup>2</sup>', TEXT_OPTIONS ),
        new Text( ' + ', TEXT_OPTIONS )
      ]
    } );
    var cParameterNode = new Text( 'c', PARAMETER_TEXT_OPTIONS );
    var dParameterNode = new Text( 'd', PARAMETER_TEXT_OPTIONS );
    var cdBlockNode = new HBox( {
      align: 'bottom',
      children: [
        cParameterNode,
        new Text( 'x + ', TEXT_OPTIONS ),
        dParameterNode
      ]
    } );

    var content = new HBox( {
      spacing: 5,
      children: [ expandCollapseButton, titleNode ]
    } );

    Panel.call( this, content, _.extend( PANEL_OPTIONS, options ) );

    // add observers
    orderFitProperty.link( function( orderFit ) {
      if ( orderFit === 1 ) {
        boxNode.children = [ yNode, cdBlockNode ];
      }
      else if ( orderFit === 2 ) {
        boxNode.children = [ yNode, bBlockNode, cdBlockNode ];
      }
      else if ( orderFit === 3 ) {
        boxNode.children = [ yNode, aBlockNode, bBlockNode, cdBlockNode ];
      }
    } );

    isEquationPanelExpandedProperty.link( function( isEquationPanelExpanded ) {
      if ( isEquationPanelExpanded ) {
        content.children = [ expandCollapseButton, boxNode ];
      }
      else {
        content.children = [ expandCollapseButton, titleNode ];
      }
    } );

    curve.isVisibleProperty.linkAttribute( this, 'visible' );

    var updateAParameter = function() {
      if ( isEquationPanelExpandedProperty.value && curve.isVisible ) {
        aParameterNode.setText( Util.toFixedNumber( curve.aProperty.value, 5 ).toString() );
      }
    };
    curve.aProperty.lazyLink( updateAParameter );
    curve.isVisibleProperty.lazyLink( updateAParameter );
    isEquationPanelExpandedProperty.link( updateAParameter );

    var updateBParameter = function() {
      if ( isEquationPanelExpandedProperty.value && curve.isVisible ) {
        bParameterNode.setText( Util.toFixedNumber( curve.bProperty.value, 4 ).toString() );
      }
    };
    curve.bProperty.lazyLink( updateBParameter );
    curve.isVisibleProperty.lazyLink( updateBParameter );
    isEquationPanelExpandedProperty.link( updateBParameter );

    var updateCParameter = function() {
      if ( isEquationPanelExpandedProperty.value && curve.isVisible ) {
        cParameterNode.setText( Util.toFixedNumber( curve.cProperty.value, 4 ).toString() );
      }
    };
    curve.cProperty.lazyLink( updateCParameter );
    curve.isVisibleProperty.lazyLink( updateCParameter );
    isEquationPanelExpandedProperty.link( updateCParameter );

    var updateDParameter = function() {
      dParameterNode.setText( Util.toFixedNumber( curve.dProperty.value, 1 ).toString() );
    };
    curve.dProperty.lazyLink( updateDParameter );
    curve.isVisibleProperty.lazyLink( updateDParameter );
    isEquationPanelExpandedProperty.link( updateDParameter );
  }

  return inherit( Panel, EquationGraphPanelNode );
} );