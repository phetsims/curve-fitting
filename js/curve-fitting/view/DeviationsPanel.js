// Copyright 2015, University of Colorado Boulder

/**
 * Deviations panel in 'Curve Fitting' simulation.
 * Contains X^2 barometer, r^2 barometer and menu dialog.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var BarometerR2Node = require( 'CURVE_FITTING/curve-fitting/view/BarometerR2Node' );
  var BarometerX2Node = require( 'CURVE_FITTING/curve-fitting/view/BarometerX2Node' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var Dialog = require( 'JOIST/Dialog' );
  var ExpandCollapseButton = require( 'SUN/ExpandCollapseButton' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var HTMLText = require( 'SCENERY/nodes/HTMLText' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Util = require( 'DOT/Util' );

  // strings
  var deviationsString = require( 'string!CURVE_FITTING/deviations' );
  var numberOfDataPointsString = require( 'string!CURVE_FITTING/numberOfDataPoints' );
  var patternNumberOfParametersInFitEG0ValueForACubicFitString = require( 'string!CURVE_FITTING/pattern.numberOfParametersInFitEG.0value.ForACubicFit' );
  var theReducedChiSquaredStatisticIsString = require( 'string!CURVE_FITTING/theReducedChiSquaredStatisticIs' );

  // images
  var equationHelpImage = require( 'image!CURVE_FITTING/equation-help.png' );
  var fSymbolImage = require( 'image!CURVE_FITTING/f-symbol.png' );
  var fEqualFourImage = require( 'image!CURVE_FITTING/f-equal-four.png' );
  var nSymbolImage = require( 'image!CURVE_FITTING/n-symbol.png' );

  // constants
  var BUTTON_LENGTH = 16;
  var EQUATION_OFFSET = 20;
  var IMAGE_SCALE = 0.23;
  var TEXT_DIALOG = new PhetFont( 14 );
  var TEXT_FONT = new PhetFont( 12 );
  var TEXT_PANEL_FONT = new PhetFont( 10 );
  var VALUE_PANEL_OPTIONS = {
    fill: 'white',
    cornerRadius: 4,
    xMargin: 4,
    yMargin: 4,
    resize: false
  };
  var PANEL_OPTIONS = {
    cornerRadius: CurveFittingConstants.PANEL_CORNER_RADIUS,
    fill: CurveFittingConstants.PANEL_BACKGROUND_COLOR
  };

  /**
   * @param {Property.<boolean>} isDeviationPanelExpandedProperty - Property to control deviation panel expansion.
   * @param {Curve} curve - Curve model.
   * @param {Object} [options] for graph node
   * @constructor
   */
  function DeviationsPanel( isDeviationPanelExpandedProperty, curve, options ) {

    // create expand button
    var expandCollapseButton = new ExpandCollapseButton( isDeviationPanelExpandedProperty, {
      sideLength: BUTTON_LENGTH
    } );
    expandCollapseButton.touchArea = expandCollapseButton.localBounds.dilatedXY( BUTTON_LENGTH, BUTTON_LENGTH );
    expandCollapseButton.mouseArea = expandCollapseButton.localBounds.dilatedXY( BUTTON_LENGTH, BUTTON_LENGTH );

    // X^2 barometer
    var barometerX2 = new BarometerX2Node( curve.chiSquareProperty, curve.points );

    // r^2 barometer
    var barometerR2 = new BarometerR2Node( curve.rSquareProperty );

    // help menu button
    var dialogContentNode = new VBox( {
      align: 'left',
      spacing: 5,
      children: [
        new Text( theReducedChiSquaredStatisticIsString, { font: TEXT_DIALOG } ),
        new HBox( {
          children: [
            new HStrut( EQUATION_OFFSET ),
            new Image( equationHelpImage, { scale: IMAGE_SCALE } )
          ]
        } ),
        new HBox( {
          children: [
            new Image( nSymbolImage, { scale: IMAGE_SCALE } ),
            new Text( '= ' + numberOfDataPointsString, { font: TEXT_DIALOG } )
          ]
        } ),
        new HBox( {
          children: [
            new Image( fSymbolImage, { scale: IMAGE_SCALE } ),
            new HTMLText( '= ' + StringUtils.format(
                patternNumberOfParametersInFitEG0ValueForACubicFitString,
                          '<img style="vertical-align: bottom; width:' + parseInt( fEqualFourImage.width * IMAGE_SCALE, 10 ) + 'px" src="' + fEqualFourImage.src + '">'
              ),
              { font: TEXT_DIALOG } )
          ]
        } )
      ]
    } );
    var helpButtonNode = new TextPushButton( '?', {
      listener: function() {
        new Dialog( dialogContentNode, {
          modal: true,
          hasCloseButton: true
        } ).show();
      },
      font: TEXT_FONT,
      baseColor: 'rgb( 204, 204, 204 )'
    } );

    // title
    var titleNode = new Text( deviationsString, { font: TEXT_FONT } );

    var deviationArrowsNode = new HBox( { align: 'top' } );

    // create chiSquare text and panel
    var chiSquareTextNode = new Text( '000.00', {
      font: TEXT_PANEL_FONT,
      textAlign: 'left'
    } );
    var chiSquarePanelNode = new Panel( chiSquareTextNode, VALUE_PANEL_OPTIONS );

    // create rSquare text and panel
    var rSquareTextNode = new Text( '0.00', {
      font: TEXT_PANEL_FONT,
      textAlign: 'left'
    } );
    var rSquarePanelNode = new Panel( rSquareTextNode, VALUE_PANEL_OPTIONS );

    var deviationTextNode = new HBox( {
      spacing: 5,
      resize: false,
      children: [
        new SubSupText( 'X<sup>2</sup>=', { font: TEXT_FONT } ),
        chiSquarePanelNode,

        new SubSupText( 'r<sup>2</sup>=', { font: TEXT_FONT } ),
        rSquarePanelNode
      ]
    } );

    var content = new VBox( _.extend( { align: 'left' }, options ) );

    var spaceBetweenBarometers = new HStrut( 10 );
    var spaceBetweenButtonAndTitle = new HStrut( 5 );
    isDeviationPanelExpandedProperty.link( function( isDeviationPanelExpanded ) {
      if ( isDeviationPanelExpanded ) {
        deviationArrowsNode.children = [ expandCollapseButton, barometerX2, spaceBetweenBarometers, barometerR2 ];
        content.children = [ deviationArrowsNode, deviationTextNode, helpButtonNode ];
        deviationArrowsNode.updateLayout();
      }
      else {
        deviationArrowsNode.children = [ expandCollapseButton, spaceBetweenButtonAndTitle, titleNode ];
        content.children = [ deviationArrowsNode ];
        deviationArrowsNode.updateLayout();
      }
    } );

    curve.chiSquareProperty.link( function( chiSquare ) {
      chiSquareTextNode.setText( Util.toFixedNumber( chiSquare, 2 ).toString() );
    } );

    curve.rSquareProperty.link( function( rSquare ) {
      rSquareTextNode.setText( Util.toFixedNumber( rSquare, 2 ).toString() );
    } );

    Panel.call( this, content, PANEL_OPTIONS );
  }

  curveFitting.register( 'DeviationsPanel', DeviationsPanel );

  return inherit( Panel, DeviationsPanel );
} );