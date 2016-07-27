// Copyright 2016, University of Colorado Boulder

/**
 * Control panel for selecting view options.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var CheckBox = require( 'SUN/CheckBox' );
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var curveString = require( 'string!CURVE_FITTING/curve' );
  var residualsString = require( 'string!CURVE_FITTING/residuals' );
  var valuesString = require( 'string!CURVE_FITTING/values' );

  /**
   * @param {Property.<boolean>} curveVisibleProperty
   * @param {Property.<boolean>} residualsVisibleProperty
   * @param {Property.<boolean>} valuesVisibleProperty
   * @param {Object} [options]
   * @constructor
   */
  function ViewOptionsPanel( curveVisibleProperty, residualsVisibleProperty, valuesVisibleProperty, options ) {

    // check boxes
    var curveCheckBox = createCheckBox( curveVisibleProperty, curveString );
    var residualsCheckBox = createCheckBox( residualsVisibleProperty, residualsString );
    var valuesCheckBox = createCheckBox( valuesVisibleProperty, valuesString );

    // vertical layout
    var contentNode = new VBox( {
      spacing: 5,
      align: 'left',
      children: [
        curveCheckBox,
        residualsCheckBox,
        valuesCheckBox ]
    } );

    Panel.call( this, contentNode, options );

    // visibility of the curve affects other controls
    curveVisibleProperty.link( function( isCurveVisible ) {
      residualsCheckBox.enabled = isCurveVisible;
      if ( !isCurveVisible ) {
        residualsVisibleProperty.set( false ); //TODO really?
      }
    } );
  }

  curveFitting.register( 'ViewOptionsPanel', ViewOptionsPanel );

  /**
   * Creates a check box for this panel.
   *
   * @param {Property} property
   * @param {string} label
   * @returns {CheckBox}
   */
  var createCheckBox = function( property, label ) {
    return new CheckBox( new Text( label, CurveFittingConstants.CONTROL_TEXT_OPTIONS ), property,
      CurveFittingConstants.CHECK_BOX_OPTIONS );
  };

  return inherit( Panel, ViewOptionsPanel );
} );
