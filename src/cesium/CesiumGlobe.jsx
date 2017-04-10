import React, {Component} from "react";

import Viewer from "cesium/Source/Widgets/Viewer/Viewer";
import BingMapsImageryProvider from "cesium/Source/Scene/BingMapsImageryProvider";
import CesiumTerrainProvider from "cesium/Source/Core/CesiumTerrainProvider";
import GeoJsonDataSource from "cesium/Source/DataSources/GeoJsonDataSource";
import Cesium from "cesium/Source/Cesium";
import Color from "cesium/Source/Core/Color";


const BING_MAPS_URL = "//dev.virtualearth.net";
const BING_MAPS_KEY = "ApDPY15x9lCXO5Hw89M1G5Q84_BlKalPbjor8GvKGj2UAnVtzlT5UT-zrylU1e48";
const STK_TERRAIN_URL = "//assets.agi.com/stk-terrain/world";

import layerTracks from "../assets/tracks.geojson";
import layerSignals from "../assets/signals.geojson";
import layerPlatforms from "../assets/platforms.geojson";

import layerCounties from "../assets/counties.geojson";



export default class CesiumGlobe extends Component {
    constructor (props){
      super(props);

      this.state = {
          viewerLoaded : false,
      }

      this.zoomToDublin = this.zoomToDublin.bind(this);
      this.zoomToCork = this.zoomToCork.bind(this);
      this.zoomToGalway = this.zoomToGalway.bind(this);
      this.population = this.population.bind(this);
      this.resetRails = this.resetRails.bind(this);


    }


    componentDidMount() {
        const imageryProvider = new BingMapsImageryProvider({
            url : BING_MAPS_URL,
            key : BING_MAPS_KEY,
        });

        const terrainProvider = new CesiumTerrainProvider({
            url : STK_TERRAIN_URL
        });

        this.tracks = new GeoJsonDataSource.load(layerTracks, {

        });
        this.signals = new GeoJsonDataSource.load(layerSignals, {
              strokeWidth: 1,
              markerSymbol: 'rail',
              markerColor: Color.BLUE,

        });
        this.platforms = new GeoJsonDataSource.load(layerPlatforms, {
            stroke: Color.RED,
            strokeWidth: 10,

        });

        this.counties = new GeoJsonDataSource.load(layerCounties, {

        });

        this.viewer = new Viewer(this.cesiumContainer, {
            //animation : false,
            //baseLayerPicker : false,
            //fullscreenButton : false,
            //geocoder : false,
            //homeButton : false,
            //infoBox : false,
            //sceneModePicker : false,
            //selectionIndicator : true,
            //timeline : false,
            //navigationHelpButton : false,
            //scene3DOnly : true,
            //imageryProvider,
            //terrainProvider,
        });

        this.viewer.dataSources.add(this.tracks);
        this.viewer.dataSources.add(this.signals);
        this.viewer.dataSources.add(this.platforms);

        this.viewer.camera.flyTo({destination : Cesium.Cartesian3.fromDegrees(-8.484, 54.272, 1500.0)})

        // Force immediate re-render now that the Cesium viewer is created
        this.setState({viewerLoaded : true}); // eslint-disable-line react/no-did-mount-set-state
    }

    componentWillUnmount() {
        if(this.viewer) {
            this.viewer.destroy();
        }
    }

    zoomToDublin(){
        this.viewer.camera.flyTo({destination : Cesium.Cartesian3.fromDegrees(-6.246, 53.353, 250.0)})
    }

    zoomToCork(){
        this.viewer.camera.flyTo({destination : Cesium.Cartesian3.fromDegrees(-8.455, 51.902, 300.0)})
    }

    zoomToGalway(){
        this.viewer.camera.flyTo({destination : Cesium.Cartesian3.fromDegrees(-9.045, 53.2725, 300.0)})
    }

    population(){
        this.viewer.dataSources.removeAll()
        this.viewer.dataSources.add(this.counties);

        this.counties.then(res => {
            var entities = res.entities.values;

            var colorHash = {};
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                var name = entity.name;
                var color = colorHash[name];
                if (!color) {
                    color = Cesium.Color.fromRandom({
                        alpha : 1.0
                    });
                    colorHash[name] = color;
                }
                entity.polygon.material = color;
                entity.polygon.outline = false;
                entity.polygon.extrudedHeight = entity.properties.TOTAL2011 / 20.0;
            }
        });

        this.viewer.zoomTo(this.counties)
    }

    resetRails(){
        this.viewer.dataSources.removeAll()

        this.viewer.dataSources.add(this.tracks);
        this.viewer.dataSources.add(this.signals);
        this.viewer.dataSources.add(this.platforms);

        this.viewer.zoomTo(this.tracks)
    }


    renderContents() {
        const {viewerLoaded} = this.state;
        let contents = null;

        if(viewerLoaded) {
            contents = (
                <span>
                </span>
            );
        }

        return contents;
    }

    render() {
        const containerStyle = {
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'fixed',
            display : "flex",
            alignItems : "stretch",
        };

        const widgetStyle = {
            flexGrow : 2
        }

        const contents = this.renderContents()

        return (
            <div>
                <div className="cesiumGlobeWrapper" style={containerStyle}>
                    <div
                        className="cesiumWidget"
                        ref={ element => this.cesiumContainer = element }
                        style={widgetStyle}
                    >
                        {contents}
                    </div>
                </div>

                <div className="panel-main">
                    <div className="tabs">
                        <a className="tab">tab1</a>
                        <a className="tab">tab2</a>
                        <a className="tab">tab3</a>
                        <hr/>
                    </div>
                    <div className="tab-content">
                        <br/>
                        <br/>
                        <br/>
                        <br/>

                        <button className="btn" onClick={this.zoomToDublin}>Fly to Dublin</button>
                        <br/>
                        <br/>
                        <button className="btn" onClick={this.zoomToCork}>Fly to Cork</button>
                        <br/>
                        <br/>
                        <button className="btn" onClick={this.zoomToGalway}>Fly to Galway</button>
                        <br/>
                        <br/>
                        <button className="btn" onClick={this.population}>3D statistics</button>
                        <br/>
                        <br/>
                        <button className="btn" onClick={this.resetRails}>Reset</button>
                    </div>
                </div>
        </div>
        );
    }
}
