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



/* ----------------------------------------------------------------------
   New entities: Gene-Cluster Families (GCF) and Biosynthetic Gene Clusters (BGC)
   ---------------------------------------------------------------------- */

/* 1.  Gene-Cluster Families
      – Only an ID for now; add extra columns later if you need (e.g. name, class, notes) */
CREATE TABLE gcfs (
                      id SERIAL PRIMARY KEY             -- integer, auto-increment
);

/* 2.  Biosynthetic Gene Clusters
      – Linked to the assemblies table (assembly ↔ assemblies.id)
      – Linked to the GCF table (gcf_id ↔ gcfs.id)                              */
CREATE TABLE bgcs (
                      id SERIAL PRIMARY KEY,
                      filename VARCHAR(200) NOT NULL,  -- Store the original filename
                      assembly VARCHAR(100) REFERENCES assemblies(id),
                      contig TEXT,
                      start INTEGER,
                      end_pos INTEGER,
                      product_class TEXT[] NOT NULL,
                      product_type TEXT[] NOT NULL,
                      anchor VARCHAR(15),
                      filepath TEXT,
                      gcf_id INTEGER REFERENCES gcfs(id),
                      gcf_membership DOUBLE PRECISION,
                      tax_id INTEGER,
                      CONSTRAINT bgcs_filename_unique UNIQUE (filename)
);

/* 3.  Performance indexes (tune as your dataset grows) */
CREATE INDEX idx_bgcs_gcf_id          ON bgcs(gcf_id);
CREATE INDEX idx_bgcs_assembly        ON bgcs(assembly);
CREATE INDEX idx_bgcs_anchor          ON bgcs(anchor);
CREATE INDEX idx_bgcs_product_class   ON bgcs USING GIN (product_class);
CREATE INDEX idx_bgcs_product_type    ON bgcs USING GIN (product_type);
CREATE INDEX idx_bgcs_filename ON bgcs(filename);



CREATE VIEW bgcs_per_assembly AS
SELECT
    a.id AS assembly_id,
    a.accession AS assembly_accession,
    COUNT(b.id) AS bgc_count
FROM
    assemblies a
        LEFT JOIN
    bgcs b ON a.id = b.assembly
GROUP BY
    a.id, a.accession;


CREATE VIEW bgcs_per_analysis AS
SELECT
    an.id AS analysis_id,
    an.accession AS analysis_accession,
    COUNT(b.id) AS bgc_count
FROM
    analyses an
        JOIN
    assembly_analyses aa ON an.id = aa.analysis_id
        JOIN
    assemblies a ON aa.assembly_id = a.id
        LEFT JOIN
    bgcs b ON a.id = b.assembly
GROUP BY
    an.id, an.accession;


CREATE VIEW bgcs_per_run AS
SELECT
    r.id AS run_id,
    r.accession AS run_accession,
    COUNT(b.id) AS bgc_count
FROM
    runs r
        JOIN
    run_assemblies ra ON r.id = ra.run_id
        JOIN
    assemblies a ON ra.assembly_id = a.id
        LEFT JOIN
    bgcs b ON a.id = b.assembly
GROUP BY
    r.id, r.accession;



CREATE VIEW bgcs_per_sample AS
SELECT
    s.id AS sample_id,
    s.accession AS sample_accession,
    COUNT(DISTINCT b.id) AS bgc_count
FROM
    samples s
        JOIN
    sample_runs sr ON s.id = sr.sample_id
        JOIN
    runs r ON sr.run_id = r.id
        JOIN
    run_assemblies ra ON r.id = ra.run_id
        JOIN
    assemblies a ON ra.assembly_id = a.id
        LEFT JOIN
    bgcs b ON a.id = b.assembly
GROUP BY
    s.id, s.accession;



CREATE VIEW bgcs_per_study AS
SELECT
    st.id AS study_id,
    st.accession AS study_accession,
    COUNT(DISTINCT b.id) AS bgc_count
FROM
    studies st
        JOIN
    study_samples ss ON st.id = ss.study_id
        JOIN
    samples s ON ss.sample_id = s.id
        JOIN
    sample_runs sr ON s.id = sr.sample_id
        JOIN
    runs r ON sr.run_id = r.id
        JOIN
    run_assemblies ra ON r.id = ra.run_id
        JOIN
    assemblies a ON ra.assembly_id = a.id
        LEFT JOIN
    bgcs b ON a.id = b.assembly
GROUP BY
    st.id, st.accession;



CREATE VIEW bgcs_per_biome AS
SELECT
    b.id AS biome_id,
    b.lineage AS biome_lineage,
    COUNT(DISTINCT bgc.id) AS bgc_count
FROM
    biomes b
        JOIN
    sample_biomes sb ON b.id = sb.biome_id
        JOIN
    samples s ON sb.sample_id = s.id
        JOIN
    sample_runs sr ON s.id = sr.sample_id
        JOIN
    runs r ON sr.run_id = r.id
        JOIN
    run_assemblies ra ON r.id = ra.run_id
        JOIN
    assemblies a ON ra.assembly_id = a.id
        LEFT JOIN
    bgcs bgc ON a.id = bgc.assembly
GROUP BY
    b.id, b.lineage;


CREATE MATERIALIZED VIEW unified_analyses_view AS
SELECT
    -- Analysis information
    an.id AS analysis_id,
    an.accession AS analysis_accession,
    an.instrument_platform,
    bpa.bgc_count,

    -- Sample information
    s.id AS sample_id,
    s.accession AS sample_accession,
    s.biosample,
    s.sample_name,
    s.latitude,
    s.longitude,
    s.geo_loc_name,
    s.environment_biome,
    s.environment_feature,
    s.environment_material,
    s.host_tax_id,
    s.species,

    -- Study information
    st.id AS study_id,
    st.accession AS study_accession,
    st.bioproject,
    st.study_name,

    -- Biome information
    b.id AS biome_id,
    b.lineage AS biome_lineage,

    -- Publications information
    STRING_AGG(DISTINCT p.doi, ', ') AS publications,
    STRING_AGG(DISTINCT CONCAT(p.title, ' (', p.doi, ')'), '; ') AS study_publications
FROM
    analyses an
        JOIN bgcs_per_analysis bpa ON an.id = bpa.analysis_id
        JOIN assembly_analyses aa ON an.id = aa.analysis_id
        JOIN assemblies a ON aa.assembly_id = a.id
        JOIN run_assemblies ra ON a.id = ra.assembly_id
        JOIN runs r ON ra.run_id = r.id
        JOIN sample_runs sr ON r.id = sr.run_id
        JOIN samples s ON sr.sample_id = s.id
        JOIN study_samples ss ON s.id = ss.sample_id
        JOIN studies st ON ss.study_id = st.id
        LEFT JOIN sample_biomes sb ON s.id = sb.sample_id
        LEFT JOIN biomes b ON sb.biome_id = b.id
        LEFT JOIN study_publications sp ON st.id = sp.study_id
        LEFT JOIN publications p ON sp.publication_id = p.id
GROUP BY
    an.id, an.accession, an.instrument_platform, bpa.bgc_count,
    s.id, s.accession, s.biosample, s.sample_name, s.latitude, s.longitude,
    s.geo_loc_name, s.environment_biome, s.environment_feature, s.environment_material,
    s.host_tax_id, s.species,
    st.id, st.accession, st.bioproject, st.study_name,
    b.id, b.lineage;
