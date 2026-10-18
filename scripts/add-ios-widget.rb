# Adds the CalmSpendWidget extension target to the Capacitor iOS project.
#
# `npx cap sync` rewrites the web assets but leaves the Xcode project alone, so
# this only has to run once per checkout — it is idempotent and safe to re-run
# after a regenerated ios/ folder. Invoke it through scripts/add-ios-widget.sh,
# which supplies the Ruby and the gem paths from the Homebrew CocoaPods install.
require 'xcodeproj'

PROJECT      = File.expand_path('../ios/App/App.xcodeproj', __dir__)
WIDGET       = 'CalmSpendWidget'
APP_TARGET   = 'App'
APP_GROUP_ID = 'group.com.calmspend.app'
WIDGET_BUNDLE_ID = 'com.calmspend.app.widget'
DEPLOYMENT   = '17.0'

project = Xcodeproj::Project.open(PROJECT)
app = project.targets.find { |t| t.name == APP_TARGET }
raise "target #{APP_TARGET} not found" unless app

# --- shared model, compiled into both targets -------------------------------
shared_group = project.main_group.find_subpath('Shared', true)
shared_group.set_source_tree('SOURCE_ROOT')
shared_group.set_path('Shared')
snapshot_ref = shared_group.files.find { |f| f.display_name == 'CalmSpendSnapshot.swift' } ||
               shared_group.new_reference('CalmSpendSnapshot.swift')

# --- the Capacitor bridge plugin belongs to the app -------------------------
app_group_node = project.main_group.find_subpath('App', true)
plugin_ref = app_group_node.files.find { |f| f.display_name == 'CalmSpendWidgetPlugin.swift' } ||
             app_group_node.new_reference('CalmSpendWidgetPlugin.swift')

app_sources = app.source_build_phase
[snapshot_ref, plugin_ref].each do |ref|
  next if app_sources.files_references.include?(ref)
  app_sources.add_file_reference(ref)
end

# App Group entitlement on the app itself.
app.build_configurations.each do |config|
  config.build_settings['CODE_SIGN_ENTITLEMENTS'] = 'App/App.entitlements'
end

# --- the widget extension target --------------------------------------------
widget = project.targets.find { |t| t.name == WIDGET }
if widget.nil?
  widget = project.new_target(:app_extension, WIDGET, :ios, DEPLOYMENT)
  puts "created target #{WIDGET}"
else
  puts "target #{WIDGET} already present — updating it"
end

widget_group = project.main_group.find_subpath(WIDGET, true)
widget_group.set_source_tree('SOURCE_ROOT')
widget_group.set_path(WIDGET)
widget_srcs = %w[CalmSpendWidget.swift CalmSpendWidgetView.swift].map do |name|
  widget_group.files.find { |f| f.display_name == name } || widget_group.new_reference(name)
end
%w[Info.plist CalmSpendWidget.entitlements].each do |name|
  widget_group.files.find { |f| f.display_name == name } || widget_group.new_reference(name)
end

widget_sources = widget.source_build_phase
(widget_srcs + [snapshot_ref]).each do |ref|
  next if widget_sources.files_references.include?(ref)
  widget_sources.add_file_reference(ref)
end

widget.build_configurations.each do |config|
  s = config.build_settings
  s['PRODUCT_BUNDLE_IDENTIFIER']   = WIDGET_BUNDLE_ID
  s['PRODUCT_NAME']                = '$(TARGET_NAME)'
  s['INFOPLIST_FILE']              = "#{WIDGET}/Info.plist"
  s['CODE_SIGN_ENTITLEMENTS']      = "#{WIDGET}/#{WIDGET}.entitlements"
  s['IPHONEOS_DEPLOYMENT_TARGET']  = DEPLOYMENT
  s['SWIFT_VERSION']               = '5.0'
  s['TARGETED_DEVICE_FAMILY']      = '1,2'
  s['SKIP_INSTALL']                = 'YES'
  s['GENERATE_INFOPLIST_FILE']     = 'NO'
  s['CODE_SIGN_STYLE']             = 'Automatic'
  s['LD_RUNPATH_SEARCH_PATHS']     = [
    '$(inherited)', '@executable_path/Frameworks', '@executable_path/../../Frameworks'
  ]
  s['SWIFT_EMIT_LOC_STRINGS']      = 'YES'
end

# --- embed the extension in the app -----------------------------------------
app.add_dependency(widget) unless app.dependencies.any? { |d| d.target == widget }

embed = app.copy_files_build_phases.find { |p| p.name == 'Embed Foundation Extensions' }
if embed.nil?
  embed = app.new_copy_files_build_phase('Embed Foundation Extensions')
  embed.symbol_dst_subfolder_spec = :plug_ins
end
unless embed.files_references.include?(widget.product_reference)
  build_file = embed.add_file_reference(widget.product_reference)
  build_file.settings = { 'ATTRIBUTES' => ['RemoveHeadersOnCopy'] }
end

project.save
puts "saved #{PROJECT}"
puts "app sources:    #{app_sources.files_references.map(&:display_name).sort.join(', ')}"
puts "widget sources: #{widget_sources.files_references.map(&:display_name).sort.join(', ')}"
