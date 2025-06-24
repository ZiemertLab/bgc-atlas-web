-- PostgreSQL Database Schema for MGnify Data
-- Database Name: atlas_v2025

-- Create the database
CREATE DATABASE "atlas_v2025";

-- Connect to the database
\c "atlas_v2025"

-- Core Tables

CREATE TABLE studies (
                         id VARCHAR(50) PRIMARY KEY,
                         accession VARCHAR(50) NOT NULL,
                         bioproject VARCHAR(50),
                         secondary_accession VARCHAR(50),
                         centre_name VARCHAR(255),
                         is_private BOOLEAN,
                         samples_count INTEGER,
                         study_name TEXT,
                         study_abstract TEXT,
                         data_origination VARCHAR(50),
                         public_release_date DATE,
                         last_update TIMESTAMP
);

CREATE TABLE samples (
                         id VARCHAR(50) PRIMARY KEY,
                         accession VARCHAR(50) NOT NULL,
                         biosample VARCHAR(50),
                         sample_name VARCHAR(255),
                         sample_alias VARCHAR(255),
                         sample_desc TEXT,
                         collection_date DATE,
                         analysis_completed DATE,
                         last_update TIMESTAMP,
                         latitude DECIMAL(9,6),
                         longitude DECIMAL(9,6),
                         geo_loc_name VARCHAR(255),
                         environment_biome VARCHAR(255),
                         environment_feature VARCHAR(255),
                         environment_material VARCHAR(255),
                         host_tax_id INTEGER,
                         species VARCHAR(255)
);

CREATE TABLE runs (
                      id VARCHAR(50) PRIMARY KEY,
                      accession VARCHAR(50) NOT NULL,
                      secondary_accession VARCHAR(50),
                      experiment_type VARCHAR(50),
                      is_private BOOLEAN,
                      ena_study_accession VARCHAR(50),
                      instrument_platform VARCHAR(50),
                      instrument_model VARCHAR(255),
                      sample_id VARCHAR(50) REFERENCES samples(id)
);

CREATE TABLE assemblies (
                            id VARCHAR(50) PRIMARY KEY,
                            accession VARCHAR(50) NOT NULL,
                            wgs_accession VARCHAR(50),
                            legacy_accession VARCHAR(50),
                            experiment_type VARCHAR(50),
                            is_private BOOLEAN,
                            coverage DECIMAL(10,2),
                            min_gap_length INTEGER
);

CREATE TABLE analyses (
                          id VARCHAR(50) PRIMARY KEY,
                          accession VARCHAR(50) NOT NULL,
                          experiment_type VARCHAR(50),
                          pipeline_version VARCHAR(10),
                          analysis_status VARCHAR(50),
                          submit_time TIMESTAMP,
                          complete_time TIMESTAMP,
                          instrument_platform VARCHAR(50),
                          instrument_model VARCHAR(255)
);

CREATE TABLE biomes (
                        id VARCHAR(255) PRIMARY KEY,
                        lineage TEXT
);

-- Relationship Tables

CREATE TABLE study_samples (
                               study_id VARCHAR(50) REFERENCES studies(id),
                               sample_id VARCHAR(50) REFERENCES samples(id),
                               PRIMARY KEY (study_id, sample_id)
);

CREATE TABLE sample_runs (
                             sample_id VARCHAR(50) REFERENCES samples(id),
                             run_id VARCHAR(50) REFERENCES runs(id),
                             PRIMARY KEY (sample_id, run_id)
);

CREATE TABLE run_assemblies (
                                run_id VARCHAR(50) REFERENCES runs(id),
                                assembly_id VARCHAR(50) REFERENCES assemblies(id),
                                PRIMARY KEY (run_id, assembly_id)
);

CREATE TABLE assembly_analyses (
                                   assembly_id VARCHAR(50) REFERENCES assemblies(id),
                                   analysis_id VARCHAR(50) REFERENCES analyses(id),
                                   PRIMARY KEY (assembly_id, analysis_id)
);

CREATE TABLE sample_biomes (
                               sample_id VARCHAR(50) REFERENCES samples(id),
                               biome_id VARCHAR(255) REFERENCES biomes(id),
                               PRIMARY KEY (sample_id, biome_id)
);

CREATE TABLE study_biomes (
                              study_id VARCHAR(50) REFERENCES studies(id),
                              biome_id VARCHAR(255) REFERENCES biomes(id),
                              PRIMARY KEY (study_id, biome_id)
);

-- Additional Metadata Tables

CREATE TABLE sample_metadata (
                                 id SERIAL PRIMARY KEY,
                                 sample_id VARCHAR(50) REFERENCES samples(id),
                                 key VARCHAR(255) NOT NULL,
                                 value TEXT,
                                 unit VARCHAR(50)
);

CREATE TABLE download_links (
                                id SERIAL PRIMARY KEY,
                                entity_type VARCHAR(20) NOT NULL, -- 'study', 'sample', 'run', 'assembly', 'analysis'
                                entity_id VARCHAR(50) NOT NULL,
                                link_type VARCHAR(50) NOT NULL,
                                url TEXT NOT NULL
);

CREATE TABLE publications (
                              id SERIAL PRIMARY KEY,
                              pubmed_id VARCHAR(50),
                              doi VARCHAR(100),
                              title TEXT,
                              authors TEXT,
                              journal VARCHAR(255),
                              volume VARCHAR(50),
                              issue VARCHAR(50),
                              pages VARCHAR(50),
                              year INTEGER
);

CREATE TABLE study_publications (
                                    study_id VARCHAR(50) REFERENCES studies(id),
                                    publication_id INTEGER REFERENCES publications(id),
                                    PRIMARY KEY (study_id, publication_id)
);

-- Indexes for Performance

-- Indexes for foreign keys
CREATE INDEX idx_samples_biome ON samples(environment_biome);
CREATE INDEX idx_runs_sample_id ON runs(sample_id);
CREATE INDEX idx_sample_metadata_sample_id ON sample_metadata(sample_id);
CREATE INDEX idx_download_links_entity ON download_links(entity_type, entity_id);

-- Indexes for common queries
CREATE INDEX idx_samples_geo ON samples(latitude, longitude);
CREATE INDEX idx_samples_collection_date ON samples(collection_date);
CREATE INDEX idx_analyses_pipeline_version ON analyses(pipeline_version);
CREATE INDEX idx_sample_metadata_key ON sample_metadata(key);
