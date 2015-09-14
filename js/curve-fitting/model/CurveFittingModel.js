// Copyright 2002-2014, University of Colorado Boulder

/**
 * Main model constructor for 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var Curve = require( 'CURVE_FITTING/curve-fitting/model/Curve' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var FitType = require( 'CURVE_FITTING/curve-fitting/model/FitType' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var SphereBucket = require( 'PHETCOMMON/model/SphereBucket' );

  /**
   * Main constructor for CurveFittingModel, which contains all of the model logic for the entire sim screen.
   * @constructor
   */
  function CurveFittingModel() {
    PropertySet.call( this, {
      areResidualsVisible: false, // residuals visibility flag
      areValuesVisible: false, // values visibility flag
      orderOfFit: 1, // property to control curve type
      fitType: FitType.BEST, // property to control fit type
      isDeviationPanelExpanded: true, // property to control deviation panel expansion
      isEquationPanelExpanded: true // property to control equation panel expansion
    } );

    // max order of fit
    this.maxOrderOfFit = 3;

    // bucket model
    var BUCKET_WIDTH = 90;
    var BUCKET_HEIGHT = BUCKET_WIDTH * 0.50;
    this.bucket = new SphereBucket( {
      size: new Dimension2( BUCKET_WIDTH, BUCKET_HEIGHT ),
      caption: '',
      baseColor: 'rgb( 65, 63, 117 )'
    } );

    // curve model
    this.curve = new Curve( this.orderOfFitProperty, this.fitTypeProperty, this.maxOrderOfFit );

    // graph area size
    this.graphArea = {
      // x-y size for point position, expecting equal x and y deltas
      size: new Bounds2( -10, -10, 10, 10 ),

      // real bounds of graph area, will be set according to available space
      bounds: new Bounds2( 0, 0, 0, 0 )
    };
  }

  return inherit( PropertySet, CurveFittingModel, {

    reset: function() {
      PropertySet.prototype.reset.call( this );

      // reset curve
      this.curve.reset();
    }
  } );
} );