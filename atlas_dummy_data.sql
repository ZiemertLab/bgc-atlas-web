-- Connect to the database
\c "atlas_v2025"

-- Insert dummy data into studies table
INSERT INTO studies (id, accession, bioproject, secondary_accession, centre_name, is_private, samples_count, study_name, study_abstract, data_origination, public_release_date, last_update)
VALUES
  ('STUDY1', 'MGYS00001234', 'PRJEB12345', 'ERP012345', 'European Bioinformatics Institute', false, 5, 'Marine Microbiome Study', 'A comprehensive study of marine microbiomes across different ocean regions.', 'SUBMITTED', '2023-01-15', '2023-01-20 10:30:00'),
  ('STUDY2', 'MGYS00005678', 'PRJEB67890', 'ERP067890', 'University of California', false, 3, 'Soil Microbiome Analysis', 'Analysis of soil microbiomes from agricultural lands.', 'SUBMITTED', '2023-02-20', '2023-02-25 14:45:00'),
  ('STUDY3', 'MGYS00009012', 'PRJEB90123', 'ERP090123', 'Max Planck Institute', false, 4, 'Human Gut Microbiome', 'Exploration of human gut microbiome diversity.', 'HARVESTED', '2023-03-10', '2023-03-15 09:15:00');

-- Insert dummy data into samples table
INSERT INTO samples (id, accession, biosample, sample_name, sample_alias, sample_desc, collection_date, analysis_completed, last_update, latitude, longitude, geo_loc_name, environment_biome, environment_feature, environment_material, host_tax_id, species)
VALUES
  ('SAMPLE1', 'MGSM00001234', 'SAMEA1234567', 'Marine Sample 1', 'MS1', 'Deep sea water sample from Atlantic Ocean', '2022-12-10', '2023-01-10', '2023-01-12 08:30:00', 41.40338, -71.92957, 'Atlantic Ocean', 'marine biome', 'ocean', 'sea water', NULL, NULL),
  ('SAMPLE2', 'MGSM00001235', 'SAMEA1234568', 'Marine Sample 2', 'MS2', 'Coastal water sample from Pacific Ocean', '2022-12-15', '2023-01-12', '2023-01-14 09:45:00', 34.05223, -118.24368, 'Pacific Ocean', 'marine biome', 'coastal zone', 'sea water', NULL, NULL),
  ('SAMPLE3', 'MGSM00001236', 'SAMEA1234569', 'Marine Sample 3', 'MS3', 'Coral reef water sample', '2022-12-20', '2023-01-15', '2023-01-17 10:15:00', -16.92304, 145.76625, 'Great Barrier Reef', 'marine biome', 'coral reef', 'sea water', NULL, NULL),
  ('SAMPLE4', 'MGSM00005678', 'SAMEA5678901', 'Soil Sample 1', 'SS1', 'Agricultural soil from wheat field', '2023-01-05', '2023-02-15', '2023-02-17 11:30:00', 51.50853, -0.12574, 'United Kingdom', 'terrestrial biome', 'agricultural land', 'soil', NULL, NULL),
  ('SAMPLE5', 'MGSM00005679', 'SAMEA5678902', 'Soil Sample 2', 'SS2', 'Forest soil sample', '2023-01-10', '2023-02-18', '2023-02-20 12:45:00', 37.77493, -122.41942, 'California', 'terrestrial biome', 'forest', 'soil', NULL, NULL),
  ('SAMPLE6', 'MGSM00009012', 'SAMEA9012345', 'Human Gut Sample 1', 'HGS1', 'Human gut microbiome sample from healthy adult', '2023-02-01', '2023-03-05', '2023-03-07 13:15:00', NULL, NULL, 'Germany', NULL, NULL, NULL, 9606, 'Homo sapiens'),
  ('SAMPLE7', 'MGSM00009013', 'SAMEA9012346', 'Human Gut Sample 2', 'HGS2', 'Human gut microbiome sample from child', '2023-02-05', '2023-03-08', '2023-03-10 14:30:00', NULL, NULL, 'Germany', NULL, NULL, NULL, 9606, 'Homo sapiens'),
  ('SAMPLE8', 'MGSM00009014', 'SAMEA9012347', 'Human Gut Sample 3', 'HGS3', 'Human gut microbiome sample from elderly', '2023-02-10', '2023-03-12', '2023-03-14 15:45:00', NULL, NULL, 'Germany', NULL, NULL, NULL, 9606, 'Homo sapiens');

-- Insert dummy data into runs table
INSERT INTO runs (id, accession, secondary_accession, experiment_type, is_private, ena_study_accession, instrument_platform, instrument_model, sample_id)
VALUES
  ('RUN1', 'MGMR00001234', 'ERR1234567', 'metagenomic', false, 'ERP012345', 'ILLUMINA', 'Illumina HiSeq 2500', 'SAMPLE1'),
  ('RUN2', 'MGMR00001235', 'ERR1234568', 'metagenomic', false, 'ERP012345', 'ILLUMINA', 'Illumina HiSeq 2500', 'SAMPLE2'),
  ('RUN3', 'MGMR00001236', 'ERR1234569', 'metagenomic', false, 'ERP012345', 'ILLUMINA', 'Illumina HiSeq 2500', 'SAMPLE3'),
  ('RUN4', 'MGMR00005678', 'ERR5678901', 'metagenomic', false, 'ERP067890', 'ILLUMINA', 'Illumina NovaSeq 6000', 'SAMPLE4'),
  ('RUN5', 'MGMR00005679', 'ERR5678902', 'metagenomic', false, 'ERP067890', 'ILLUMINA', 'Illumina NovaSeq 6000', 'SAMPLE5'),
  ('RUN6', 'MGMR00009012', 'ERR9012345', 'metagenomic', false, 'ERP090123', 'ILLUMINA', 'Illumina NovaSeq 6000', 'SAMPLE6'),
  ('RUN7', 'MGMR00009013', 'ERR9012346', 'metagenomic', false, 'ERP090123', 'ILLUMINA', 'Illumina NovaSeq 6000', 'SAMPLE7'),
  ('RUN8', 'MGMR00009014', 'ERR9012347', 'metagenomic', false, 'ERP090123', 'ILLUMINA', 'Illumina NovaSeq 6000', 'SAMPLE8');

-- Insert dummy data into assemblies table
INSERT INTO assemblies (id, accession, wgs_accession, legacy_accession, experiment_type, is_private, coverage, min_gap_length)
VALUES
  ('ASSEMBLY1', 'MGMA00001234', 'CABCDE01', 'ERS1234567', 'metagenomic', false, 120.5, 10),
  ('ASSEMBLY2', 'MGMA00001235', 'CABCDE02', 'ERS1234568', 'metagenomic', false, 115.2, 10),
  ('ASSEMBLY3', 'MGMA00001236', 'CABCDE03', 'ERS1234569', 'metagenomic', false, 118.7, 10),
  ('ASSEMBLY4', 'MGMA00005678', 'CABCDE04', 'ERS5678901', 'metagenomic', false, 130.1, 5),
  ('ASSEMBLY5', 'MGMA00005679', 'CABCDE05', 'ERS5678902', 'metagenomic', false, 125.8, 5),
  ('ASSEMBLY6', 'MGMA00009012', 'CABCDE06', 'ERS9012345', 'metagenomic', false, 140.3, 5),
  ('ASSEMBLY7', 'MGMA00009013', 'CABCDE07', 'ERS9012346', 'metagenomic', false, 135.6, 5),
  ('ASSEMBLY8', 'MGMA00009014', 'CABCDE08', 'ERS9012347', 'metagenomic', false, 138.9, 5);

-- Insert dummy data into analyses table
INSERT INTO analyses (id, accession, experiment_type, pipeline_version, analysis_status, submit_time, complete_time, instrument_platform, instrument_model)
VALUES
  ('ANALYSIS1', 'MGYA00001234', 'metagenomic', '5.0', 'COMPLETED', '2023-01-05 08:00:00', '2023-01-10 15:30:00', 'ILLUMINA', 'Illumina HiSeq 2500'),
  ('ANALYSIS2', 'MGYA00001235', 'metagenomic', '5.0', 'COMPLETED', '2023-01-07 09:15:00', '2023-01-12 16:45:00', 'ILLUMINA', 'Illumina HiSeq 2500'),
  ('ANALYSIS3', 'MGYA00001236', 'metagenomic', '5.0', 'COMPLETED', '2023-01-10 10:30:00', '2023-01-15 17:15:00', 'ILLUMINA', 'Illumina HiSeq 2500'),
  ('ANALYSIS4', 'MGYA00005678', 'metagenomic', '5.0', 'COMPLETED', '2023-02-10 11:45:00', '2023-02-15 18:30:00', 'ILLUMINA', 'Illumina NovaSeq 6000'),
  ('ANALYSIS5', 'MGYA00005679', 'metagenomic', '5.0', 'COMPLETED', '2023-02-13 12:15:00', '2023-02-18 19:45:00', 'ILLUMINA', 'Illumina NovaSeq 6000'),
  ('ANALYSIS6', 'MGYA00009012', 'metagenomic', '5.0', 'COMPLETED', '2023-03-01 13:30:00', '2023-03-05 20:15:00', 'ILLUMINA', 'Illumina NovaSeq 6000'),
  ('ANALYSIS7', 'MGYA00009013', 'metagenomic', '5.0', 'COMPLETED', '2023-03-03 14:45:00', '2023-03-08 21:30:00', 'ILLUMINA', 'Illumina NovaSeq 6000'),
  ('ANALYSIS8', 'MGYA00009014', 'metagenomic', '5.0', 'COMPLETED', '2023-03-07 15:15:00', '2023-03-12 22:45:00', 'ILLUMINA', 'Illumina NovaSeq 6000');

-- Insert dummy data into biomes table
INSERT INTO biomes (id, lineage)
VALUES
  ('marine biome', 'root:Environmental:Aquatic:Marine'),
  ('terrestrial biome', 'root:Environmental:Terrestrial'),
  ('host-associated biome', 'root:Host-Associated:Human');

-- Insert dummy data into relationship tables
-- study_samples
INSERT INTO study_samples (study_id, sample_id)
VALUES
  ('STUDY1', 'SAMPLE1'),
  ('STUDY1', 'SAMPLE2'),
  ('STUDY1', 'SAMPLE3'),
  ('STUDY2', 'SAMPLE4'),
  ('STUDY2', 'SAMPLE5'),
  ('STUDY3', 'SAMPLE6'),
  ('STUDY3', 'SAMPLE7'),
  ('STUDY3', 'SAMPLE8');

-- sample_runs
INSERT INTO sample_runs (sample_id, run_id)
VALUES
  ('SAMPLE1', 'RUN1'),
  ('SAMPLE2', 'RUN2'),
  ('SAMPLE3', 'RUN3'),
  ('SAMPLE4', 'RUN4'),
  ('SAMPLE5', 'RUN5'),
  ('SAMPLE6', 'RUN6'),
  ('SAMPLE7', 'RUN7'),
  ('SAMPLE8', 'RUN8');

-- run_assemblies
INSERT INTO run_assemblies (run_id, assembly_id)
VALUES
  ('RUN1', 'ASSEMBLY1'),
  ('RUN2', 'ASSEMBLY2'),
  ('RUN3', 'ASSEMBLY3'),
  ('RUN4', 'ASSEMBLY4'),
  ('RUN5', 'ASSEMBLY5'),
  ('RUN6', 'ASSEMBLY6'),
  ('RUN7', 'ASSEMBLY7'),
  ('RUN8', 'ASSEMBLY8');

-- assembly_analyses
INSERT INTO assembly_analyses (assembly_id, analysis_id)
VALUES
  ('ASSEMBLY1', 'ANALYSIS1'),
  ('ASSEMBLY2', 'ANALYSIS2'),
  ('ASSEMBLY3', 'ANALYSIS3'),
  ('ASSEMBLY4', 'ANALYSIS4'),
  ('ASSEMBLY5', 'ANALYSIS5'),
  ('ASSEMBLY6', 'ANALYSIS6'),
  ('ASSEMBLY7', 'ANALYSIS7'),
  ('ASSEMBLY8', 'ANALYSIS8');

-- sample_biomes
INSERT INTO sample_biomes (sample_id, biome_id)
VALUES
  ('SAMPLE1', 'marine biome'),
  ('SAMPLE2', 'marine biome'),
  ('SAMPLE3', 'marine biome'),
  ('SAMPLE4', 'terrestrial biome'),
  ('SAMPLE5', 'terrestrial biome'),
  ('SAMPLE6', 'host-associated biome'),
  ('SAMPLE7', 'host-associated biome'),
  ('SAMPLE8', 'host-associated biome');

-- study_biomes
INSERT INTO study_biomes (study_id, biome_id)
VALUES
  ('STUDY1', 'marine biome'),
  ('STUDY2', 'terrestrial biome'),
  ('STUDY3', 'host-associated biome');

-- Insert dummy data into sample_metadata table
INSERT INTO sample_metadata (sample_id, key, value, unit)
VALUES
  ('SAMPLE1', 'depth', '1000', 'm'),
  ('SAMPLE1', 'temperature', '4.5', 'C'),
  ('SAMPLE1', 'salinity', '35', 'PSU'),
  ('SAMPLE2', 'depth', '10', 'm'),
  ('SAMPLE2', 'temperature', '18.2', 'C'),
  ('SAMPLE2', 'salinity', '33', 'PSU'),
  ('SAMPLE3', 'depth', '5', 'm'),
  ('SAMPLE3', 'temperature', '25.7', 'C'),
  ('SAMPLE3', 'salinity', '34', 'PSU'),
  ('SAMPLE4', 'pH', '6.8', NULL),
  ('SAMPLE4', 'organic_matter', '4.2', '%'),
  ('SAMPLE5', 'pH', '7.2', NULL),
  ('SAMPLE5', 'organic_matter', '8.5', '%'),
  ('SAMPLE6', 'age', '35', 'years'),
  ('SAMPLE6', 'bmi', '22.5', 'kg/m²'),
  ('SAMPLE7', 'age', '10', 'years'),
  ('SAMPLE7', 'bmi', '18.1', 'kg/m²'),
  ('SAMPLE8', 'age', '72', 'years'),
  ('SAMPLE8', 'bmi', '24.3', 'kg/m²');

-- Insert dummy data into download_links table
INSERT INTO download_links (entity_type, entity_id, link_type, url)
VALUES
  ('study', 'STUDY1', 'project_page', 'https://www.ebi.ac.uk/metagenomics/studies/MGYS00001234'),
  ('study', 'STUDY2', 'project_page', 'https://www.ebi.ac.uk/metagenomics/studies/MGYS00005678'),
  ('study', 'STUDY3', 'project_page', 'https://www.ebi.ac.uk/metagenomics/studies/MGYS00009012'),
  ('sample', 'SAMPLE1', 'fastq', 'https://www.ebi.ac.uk/metagenomics/samples/MGSM00001234/runs/MGMR00001234/results/sequence-data'),
  ('sample', 'SAMPLE2', 'fastq', 'https://www.ebi.ac.uk/metagenomics/samples/MGSM00001235/runs/MGMR00001235/results/sequence-data'),
  ('assembly', 'ASSEMBLY1', 'fasta', 'https://www.ebi.ac.uk/metagenomics/assemblies/MGMA00001234/downloads'),
  ('assembly', 'ASSEMBLY2', 'fasta', 'https://www.ebi.ac.uk/metagenomics/assemblies/MGMA00001235/downloads'),
  ('analysis', 'ANALYSIS1', 'results', 'https://www.ebi.ac.uk/metagenomics/analyses/MGYA00001234/results'),
  ('analysis', 'ANALYSIS2', 'results', 'https://www.ebi.ac.uk/metagenomics/analyses/MGYA00001235/results');

-- Insert dummy data into publications table
INSERT INTO publications (pubmed_id, doi, title, authors, journal, volume, issue, pages, year)
VALUES
  ('35123456', '10.1038/s41586-023-12345-6', 'Global patterns of marine microbiome diversity', 'Smith J, Johnson A, Williams B', 'Nature', '605', '7919', '123-130', 2023),
  ('35123457', '10.1126/science.abc1234', 'Soil microbiome responses to climate change', 'Brown C, Davis D, Miller E', 'Science', '380', '6642', '456-463', 2023),
  ('35123458', '10.1016/j.cell.2023.01.012', 'Human gut microbiome in health and disease', 'Wilson F, Taylor G, Anderson H', 'Cell', '186', '3', '789-801', 2023);

-- Insert dummy data into study_publications table
INSERT INTO study_publications (study_id, publication_id)
VALUES
  ('STUDY1', 1),
  ('STUDY2', 2),
  ('STUDY3', 3);

-- Insert dummy data into gcfs table
-- Since id is SERIAL, we don't need to specify it
INSERT INTO gcfs VALUES
  (DEFAULT),
  (DEFAULT),
  (DEFAULT),
  (DEFAULT),
  (DEFAULT);

-- Insert dummy data into bgcs table
INSERT INTO bgcs (id, assembly, contig, start, end_pos, product_class, product_type, anchor, filepath, gcf_id, gcf_membership, tax_id)
VALUES
  ('BGC0001', 'ASSEMBLY1', 'contig_00001', 12500, 25000, ARRAY['NRPS'], ARRAY['NRPS'], 'C1PKS', '/data/bgcs/BGC0001.gbk', 1, 0.95, 562),
  ('BGC0002', 'ASSEMBLY1', 'contig_00002', 45000, 65000, ARRAY['PKS'], ARRAY['Type I PKS'], 'C2PKS', '/data/bgcs/BGC0002.gbk', 1, 0.92, 562),
  ('BGC0003', 'ASSEMBLY2', 'contig_00001', 5000, 15000, ARRAY['RiPP'], ARRAY['Lanthipeptide'], 'LANC_like', '/data/bgcs/BGC0003.gbk', 2, 0.88, 1280),
  ('BGC0004', 'ASSEMBLY3', 'contig_00003', 78000, 95000, ARRAY['Terpene'], ARRAY['Terpene'], 'Terpene_synth', '/data/bgcs/BGC0004.gbk', 3, 0.97, 1423),
  ('BGC0005', 'ASSEMBLY4', 'contig_00002', 120000, 145000, ARRAY['PKS', 'NRPS'], ARRAY['Type I PKS', 'NRPS'], 'C1PKS', '/data/bgcs/BGC0005.gbk', 4, 0.91, 1762),
  ('BGC0006', 'ASSEMBLY5', 'contig_00001', 8000, 22000, ARRAY['Saccharide'], ARRAY['Saccharide'], 'Glycos_transf', '/data/bgcs/BGC0006.gbk', 5, 0.85, 1883),
  ('BGC0007', 'ASSEMBLY6', 'contig_00004', 55000, 75000, ARRAY['NRPS'], ARRAY['NRPS'], 'AMP-binding', '/data/bgcs/BGC0007.gbk', 1, 0.93, 28901),
  ('BGC0008', 'ASSEMBLY7', 'contig_00002', 30000, 50000, ARRAY['RiPP'], ARRAY['Bacteriocin'], 'TIGR03651', '/data/bgcs/BGC0008.gbk', 2, 0.89, 28901),
  ('BGC0009', 'ASSEMBLY8', 'contig_00001', 100000, 125000, ARRAY['PKS'], ARRAY['Type II PKS'], 'C2PKS', '/data/bgcs/BGC0009.gbk', 3, 0.94, 28901),
  ('BGC0010', 'ASSEMBLY8', 'contig_00003', 200000, 230000, ARRAY['PKS', 'Terpene'], ARRAY['Type I PKS', 'Terpene'], 'C1PKS', '/data/bgcs/BGC0010.gbk', 4, 0.90, 28901);
